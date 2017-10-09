using System;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace GeoNames.pdf
{
    public class pdfPage : iTextSharp.text.pdf.PdfPageEventHelper
    {
        //font object to use within my footer
        protected Font footer
        {
            get
            {
                // create a basecolor to use for the footer font, if needed.
                iTextSharp.text.Color grey = new Color(128, 128, 128);
                Font font = FontFactory.GetFont("Arial", 9, Font.NORMAL, grey);
                return font;
            }
        }

        //override the OnStartPage event handler to add our header
        public override void OnStartPage(PdfWriter writer, Document doc)
        {
            //PdfPtable with 1 column to position my header where I want it
            PdfPTable headerTbl = new PdfPTable(1);

            //set the width of the table to be the same as the document
            headerTbl.TotalWidth = doc.PageSize.Width;

            PdfPCell cell = new PdfPCell();
            
            //initialize any fonts
            iTextSharp.text.Font font1 = new iTextSharp.text.Font(iTextSharp.text.Font.COURIER, 14, iTextSharp.text.Font.BOLD);
            iTextSharp.text.Font font2 = new iTextSharp.text.Font(iTextSharp.text.Font.COURIER, 9, iTextSharp.text.Font.ITALIC);

            // initialize the paragraphs and add them to the document 
            Paragraph paragraph1 = new Paragraph("Spatial Library Search", font1);
            paragraph1.Alignment = Element.ALIGN_CENTER;
            Paragraph paragraph2 = new Paragraph("GBA Literatursuche über GeoNames.org", font2);
            paragraph2.Alignment = Element.ALIGN_CENTER;
            //Paragraph paragraph3 = new Paragraph("Fax: Allgemein: 712-56-74/56; Bibliothek: 712-56-74/90", font2);
            ////paragraph3.Add(Environment.NewLine);
            //paragraph3.Alignment = Element.ALIGN_CENTER;
            cell.AddElement(paragraph1);
            cell.AddElement(paragraph2);
            //cell.AddElement(paragraph3);

            //align the logo to the right of the cell
            cell.HorizontalAlignment = Element.ALIGN_RIGHT;
            //add a bit of padding to bring it away from the right edge
            //cell.PaddingRight = 20;
            //remove the border
            cell.Border = PdfPCell.NO_BORDER;

            //Add the cell to the table
            headerTbl.AddCell(cell);

            //write the rows out to the PDF output stream. I use the height of the document to position the table. Positioning seems quite strange in iTextSharp and caused me the biggest headache.. It almost seems like it starts from the bottom of the page and works up to the top, so you may ned to play around with this.
            headerTbl.WriteSelectedRows(0, -1, 0, (doc.PageSize.Height - 10), writer.DirectContent);

        }

        //override the OnPageEnd event handler to add our footer
        public override void OnEndPage(PdfWriter writer, Document doc)
        {
            //PdfPtable with 2 columns to position my footer where I want it
            PdfPTable footerTbl = new PdfPTable(2);
            //set the width of the table to be the same as the document
            footerTbl.TotalWidth = doc.PageSize.Width;
            //Center the table on the page
            footerTbl.HorizontalAlignment = Element.ALIGN_CENTER;

            //Create a paragraph that contains the footer text
            DateTime currTime = DateTime.Now;
            Paragraph para = new Paragraph(currTime.Date.ToShortDateString() + " " + currTime.ToShortTimeString(), footer);
            //create a cell instance to hold the text
            PdfPCell cell = new PdfPCell(para);
            //set cell border to 0
            cell.Border = PdfPCell.NO_BORDER;
            //add some padding to bring away from the edge
            cell.PaddingLeft = 10;

            //add cell to table
            footerTbl.AddCell(cell);

            //create new instance of Paragraph for 2nd cell text
            //para = new Paragraph("Some text for the second cell", footer);
            para = new Paragraph(doc.PageNumber.ToString(), footer);
            //create new instance of cell to hold the text
            cell = new PdfPCell(para);
            //align the text to the right of the cell
            cell.HorizontalAlignment = Element.ALIGN_RIGHT;
            //set border to 0
            cell.Border = PdfPCell.NO_BORDER;
            // add some padding to take away from the edge of the page
            cell.PaddingRight = 10;
            //add the cell to the table
            footerTbl.AddCell(cell);

            //write the rows out to the PDF output stream.
            footerTbl.WriteSelectedRows(0, -1, 0, (doc.BottomMargin + 10), writer.DirectContent);
        }



    }
}