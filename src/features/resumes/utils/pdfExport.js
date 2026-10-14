import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Clean, high-fidelity PDF exporter for resume templates
 * Renders the resume preview element to canvas with retina scaling
 * and fits precisely to a standard A4 / Letter document.
 */
export async function exportResumeToPdf(elementId, filename = 'resume.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Resume preview element with id "${elementId}" not found.`);
  }

  // Force light mode styling on the canvas capture for optimal printed readability
  const originalBackground = element.style.backgroundColor;
  const originalColor = element.style.color;

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution retina rendering
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: element.scrollWidth,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 standard width in mm
    const pageHeight = 297; // A4 standard height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Handle multi-page resumes cleanly
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
    return true;
  } catch (err) {
    console.error('PDF export failed:', err);
    throw err;
  } finally {
    element.style.backgroundColor = originalBackground;
    element.style.color = originalColor;
  }
}
