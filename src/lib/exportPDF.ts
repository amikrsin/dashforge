import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function toSafeColor(colorStr: string, ctx: CanvasRenderingContext2D | null, fallback = '#6366f1'): string {
  if (!colorStr || typeof colorStr !== 'string') return colorStr;
  if (!colorStr.includes('oklch') && !colorStr.includes('color-mix') && !colorStr.includes('lab') && !colorStr.includes('lch')) {
    return colorStr;
  }
  if (ctx) {
    ctx.fillStyle = 'rgba(1, 2, 3, 0.5)';
    try {
      ctx.fillStyle = colorStr;
      const res = ctx.fillStyle;
      if (res && res !== 'rgba(1, 2, 3, 0.5)' && !res.includes('oklch') && !res.includes('color-mix')) {
        return res;
      }
    } catch {
      // ignore
    }
  }
  return fallback;
}

function sanitizeCssText(cssText: string, ctx: CanvasRenderingContext2D | null): string {
  if (!cssText || typeof cssText !== 'string') return cssText;
  if (!cssText.includes('oklch') && !cssText.includes('color-mix') && !cssText.includes('lab') && !cssText.includes('lch')) {
    return cssText;
  }

  // Replace oklch(...) function calls including up to 1 level of nested parentheses
  let cleaned = cssText.replace(/oklch\((?:[^()]+|\([^()]*\))*\)/gi, (match) => {
    return toSafeColor(match, ctx, '#6366f1');
  });

  // Replace color-mix(...) function calls
  cleaned = cleaned.replace(/color-mix\((?:[^()]+|\([^()]*\))*\)/gi, (match) => {
    return toSafeColor(match, ctx, '#6366f1');
  });

  // Replace lab/lch
  cleaned = cleaned.replace(/(?:lab|lch)\((?:[^()]+|\([^()]*\))*\)/gi, (match) => {
    return toSafeColor(match, ctx, '#6366f1');
  });

  return cleaned;
}

export async function exportDashboardToPDF(
  containerId: string,
  dashboardTitle: string = 'Executive Dashboard'
): Promise<void> {
  const element = document.getElementById(containerId);
  if (!element) {
    throw new Error(`Dashboard container element '${containerId}' was not found.`);
  }

  // Temporary canvas rendering with clean styling and full document dimensions
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#f8fafc', // slate-50
    scrollX: 0,
    scrollY: 0,
    windowWidth: element.scrollWidth || 1400,
    windowHeight: element.scrollHeight || 1000,
    onclone: (clonedDoc, clonedElement) => {
      // Create a dummy canvas for browser-native color resolution
      const dummyCanvas = clonedDoc.createElement('canvas');
      const ctx = dummyCanvas.getContext('2d');

      // 1. Sanitize all <style> tags in clonedDoc
      const styleElements = Array.from(clonedDoc.querySelectorAll('style'));
      styleElements.forEach((styleEl) => {
        let rawCss = '';
        if (styleEl.sheet) {
          try {
            const rules = Array.from(styleEl.sheet.cssRules);
            rawCss = rules.map(r => r.cssText).join('\n');
          } catch {
            rawCss = styleEl.textContent || '';
          }
        } else {
          rawCss = styleEl.textContent || '';
        }

        if (rawCss && (rawCss.includes('oklch') || rawCss.includes('color-mix') || rawCss.includes('lab') || rawCss.includes('lch'))) {
          styleEl.textContent = sanitizeCssText(rawCss, ctx);
        }
      });

      // 2. Sanitize inline and computed styles on all cloned elements
      const allNodes = [clonedElement, ...Array.from(clonedElement.querySelectorAll('*'))] as HTMLElement[];
      const colorProps = [
        'color',
        'background-color',
        'border-color',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
        'outline-color',
        'fill',
        'stroke'
      ];

      allNodes.forEach((node) => {
        if (!node || node.nodeType !== Node.ELEMENT_NODE) return;

        try {
          const cs = window.getComputedStyle(node);
          colorProps.forEach((prop) => {
            const val = cs.getPropertyValue(prop);
            if (val && (val.includes('oklch') || val.includes('color-mix') || val.includes('lab') || val.includes('lch'))) {
              const safe = toSafeColor(val, ctx);
              node.style.setProperty(prop, safe, 'important');
            }
          });
        } catch {
          // ignore computed style errors
        }

        const styleAttr = node.getAttribute('style');
        if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('color-mix') || styleAttr.includes('lab') || styleAttr.includes('lch'))) {
          node.setAttribute('style', sanitizeCssText(styleAttr, ctx));
        }

        ['fill', 'stroke', 'color'].forEach((attr) => {
          const attrVal = node.getAttribute(attr);
          if (attrVal && (attrVal.includes('oklch') || attrVal.includes('color-mix') || attrVal.includes('lab') || attrVal.includes('lch'))) {
            node.setAttribute(attr, sanitizeCssText(attrVal, ctx));
          }
        });
      });

      // Ensure cloned container expands fully without overflow clipping
      clonedElement.style.height = 'auto';
      clonedElement.style.maxHeight = 'none';
      clonedElement.style.overflow = 'visible';

      // Fix SVG sizing issues for vector charts
      const svgs = clonedElement.querySelectorAll('svg');
      svgs.forEach((svg) => {
        if (!svg.getAttribute('width')) {
          const rect = svg.getBoundingClientRect();
          if (rect.width) svg.setAttribute('width', `${rect.width}px`);
        }
        if (!svg.getAttribute('height')) {
          const rect = svg.getBoundingClientRect();
          if (rect.height) svg.setAttribute('height', `${rect.height}px`);
        }
      });
    }
  });

  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error('Failed to capture dashboard layout to canvas.');
  }

  const imgData = canvas.toDataURL('image/png');

  // Support both default & named module exports for jsPDF
  const jsPDFClass = (jsPDF as any).jsPDF || jsPDF;
  const pdf = new jsPDFClass({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const margin = 10;
  const printableWidth = pdfWidth - margin * 2;
  const printableHeight = pdfHeight - margin * 2;

  const imgWidth = printableWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let yPosition = margin;

  // Page 1
  pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
  heightLeft -= printableHeight;

  // Multi-page slicing for content below the fold
  while (heightLeft > 0) {
    yPosition -= printableHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
    heightLeft -= printableHeight;
  }

  const sanitizedTitle = dashboardTitle.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || 'dashboard';
  pdf.save(`${sanitizedTitle}_dashforge.pdf`);
}

