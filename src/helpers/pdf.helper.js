const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFHelper {
  static generateFuelReport(data, user) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const filename = `fuel_report_${user.id}_${Date.now()}.pdf`;
        const filepath = path.join(__dirname, '../../reports', filename);

        // Ensure reports directory exists
        if (!fs.existsSync(path.dirname(filepath))) {
          fs.mkdirSync(path.dirname(filepath), { recursive: true });
        }

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('Fuel Management Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated for: ${user.name}`, { align: 'center' });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);

        // Summary section
        doc.fontSize(16).text('Summary', { underline: true });
        doc.moveDown();
        doc.fontSize(10);
        doc.text(`Total Fuel Entries: ${data.totalEntries}`);
        doc.text(`Total Fuel Consumed: ${data.totalFuel.toFixed(2)} liters`);
        doc.text(`Total Distance: ${data.totalDistance.toFixed(2)} km`);
        doc.text(`Average Fuel Efficiency: ${data.averageEfficiency.toFixed(2)} km/l`);
        doc.text(`Total Cost: ₹${data.totalCost.toFixed(2)}`);
        doc.moveDown(2);

        // Fuel entries table
        doc.fontSize(16).text('Fuel Entries', { underline: true });
        doc.moveDown();

        // Table headers
        const tableTop = doc.y;
        doc.fontSize(8);
        doc.text('Date', 50, tableTop);
        doc.text('Vehicle', 120, tableTop);
        doc.text('Fuel (L)', 200, tableTop);
        doc.text('Distance (km)', 250, tableTop);
        doc.text('Efficiency (km/l)', 320, tableTop);
        doc.text('Cost (₹)', 400, tableTop);

        // Table line
        doc.moveTo(50, tableTop + 15).lineTo(500, tableTop + 15).stroke();
        doc.moveDown(2);

        // Table data
        data.entries.forEach((entry, index) => {
          const y = doc.y;
          doc.text(new Date(entry.date).toLocaleDateString(), 50, y);
          doc.text(entry.vehicle?.name || 'N/A', 120, y);
          doc.text(entry.fuelAmount.toFixed(2), 200, y);
          doc.text(entry.distance.toFixed(2), 250, y);
          doc.text(entry.efficiency.toFixed(2), 320, y);
          doc.text(entry.cost.toFixed(2), 400, y);
          doc.moveDown();
        });

        doc.end();

        stream.on('finish', () => {
          resolve({ filepath, filename });
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  static generateSavingsReport(data, user) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const filename = `savings_report_${user.id}_${Date.now()}.pdf`;
        const filepath = path.join(__dirname, '../../reports', filename);

        if (!fs.existsSync(path.dirname(filepath))) {
          fs.mkdirSync(path.dirname(filepath), { recursive: true });
        }

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('Fuel Savings Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated for: ${user.name}`, { align: 'center' });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);

        // Savings summary
        doc.fontSize(16).text('Savings Summary', { underline: true });
        doc.moveDown();
        doc.fontSize(10);
        doc.text(`Potential Monthly Savings: ₹${data.monthlySavings.toFixed(2)}`);
        doc.text(`Annual Savings: ₹${data.annualSavings.toFixed(2)}`);
        doc.text(`Fuel Saved: ${data.fuelSaved.toFixed(2)} liters`);
        doc.moveDown(2);

        // Tips section
        doc.fontSize(16).text('Fuel Saving Tips', { underline: true });
        doc.moveDown();
        doc.fontSize(10);

        data.tips.forEach((tip, index) => {
          doc.text(`${index + 1}. ${tip.title}`);
          doc.text(`   ${tip.description}`);
          doc.text(`   Potential Savings: ₹${tip.savings.toFixed(2)} per month`);
          doc.moveDown();
        });

        doc.end();

        stream.on('finish', () => {
          resolve({ filepath, filename });
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PDFHelper;
