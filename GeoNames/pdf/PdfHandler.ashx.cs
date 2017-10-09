using System;
using System.Collections.Generic;
using System.IO;
using System.Web;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System.Linq;
using Adlib.Data;
using System.Text;
using GeoNames.Entities;

using it = iTextSharp.text;

namespace GeoNames.pdf
{
    /// <summary>
    /// This generic Handler creates a pdf document for the result locations:
    /// </summary>
    public class PdfHandler : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            string assemblyName = System.IO.Path.GetFileName(System.Reflection.Assembly.GetExecutingAssembly().GetName().CodeBase.ToString());
            // make sure it is sent as a PDF
            // make sure it is downloaded rather than viewed in the browser window            
            //context.Response.AddHeader("Content-disposition", "inline; filename=adlibLocations.pdf");
            context.Response.AddHeader("Content-disposition", "attachment; filename=adlibLocations.pdf");

            String _adlibLocationListString = String.Empty;
            if (!String.IsNullOrEmpty(context.Request.Form["adlibLocationArray"]))
            {
                //_adlibLocationListString = Convert.ToString(context.Request.Form["adlibLocationArray"]);
                _adlibLocationListString = context.Request.Form["adlibLocationArray"];
                _adlibLocationListString = HttpUtility.UrlDecode(_adlibLocationListString, Encoding.Default);
            }
            else
            {
                return;
            }
           System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
           List<ResultLocation> _adlibLocationList = serializer.Deserialize<List<ResultLocation>>(_adlibLocationListString);

           if (_adlibLocationList.Count() == 0)
           {
               return;
           }
             // create a MemoryStream (as there may not be write access to any folder on the server)
           using (MemoryStream m = new MemoryStream())
           {
               // Create a new pdf document object using the constructor. 
               //The parameters passed are document size, left margin, right margin, top margin and bottom margin. 
               iTextSharp.text.Document document = new iTextSharp.text.Document(PageSize.A4, 0, 0, 85, 10);
               // define fonts
               Font titleFont = FontFactory.GetFont("Helvetica", 14, Font.BOLD, new iTextSharp.text.Color(0, 179, 212));
               Font textFont = FontFactory.GetFont("Helvetica", 8, Font.NORMAL, iTextSharp.text.Color.BLACK);

               try
               {
                   //create an instance of your PDFpage class. 
                   pdfPage page = new pdfPage();
                   PdfWriter pdfWriter = PdfWriter.GetInstance(document, m);
                   //set the PageEvent of the pdfWriter instance to the instance of the PDFPage class
                   pdfWriter.PageEvent = page;
                   //pdfWriter.SetFullCompression();

                   // set meta data
                   document.AddTitle("Adlib Locations");
                   document.AddSubject("Spatial Library Search");
                   document.AddKeywords("Spatial Library Search, GBA Literatursuche über GeoNames");
                   document.AddCreator(".NET Assembly: " + assemblyName);
                   document.AddAuthor("Arno Kaimbacher");

                   //open document to add content
                   document.Open();                  

                   //iTextSharp.text.RomanList romanlist = new RomanList(true, 20);
                   //romanlist.IndentationLeft = 10f;
                   iTextSharp.text.List resultlist = new iTextSharp.text.List(List.ORDERED, 20f);
                   resultlist.SetListSymbol("\u2022");
                   resultlist.IndentationLeft =10f;

                   foreach (ResultLocation adlibLocation in _adlibLocationList)
                   {
                       resultlist.Add(adlibLocation.name);

                       it.List unorderedlist = new it.List(it.List.UNORDERED, 10f);
                       unorderedlist.SetListSymbol("\u2022");
                       unorderedlist.IndentationLeft = 10f;
                       foreach (AdlibArticle adlibArticle in adlibLocation.adlibArticles)
                       {
                           if (adlibArticle.visible == false)
                           {
                               continue;
                           }
                           string link = "http://opac.geologie.ac.at/ais312/dispatcher.aspx?action=search&database=ChoiceFullCatalogue&search=(priref=" + adlibArticle.priref + ")";
                           it.Chunk chunk = new it.Chunk(adlibArticle.title, textFont).SetAction(new PdfAction(link, false));//.SetAnchor(link);
                           if (adlibArticle.verifiziert == true)
                           {
                               chunk.SetBackground(new it.Color(190, 227, 194));//#Bee3C2
                           }
                           else
                           {
                               chunk.SetBackground(new it.Color(225, 229, 226));//#E1E5E2
                           }
                           it.ListItem li = new it.ListItem(chunk);  
                           unorderedlist.Add(li);
                       }
                       if (unorderedlist.Items.Count > 0)
                       {
                           resultlist.Add(unorderedlist);
                       }
                   }

                   document.Add(resultlist);
               }
               catch (iTextSharp.text.DocumentException dex)
               {
                   context.Response.Write(dex.Message);
               }
               catch (IOException ioex)
               {
                   context.Response.Write(ioex.Message);
               }
               finally //finally wird immer ausgeführt
               {
                   // close the document
                   if (document != null)
                   {
                       document.Close();
                   }
                   //document = null;
                  
               }

               // close the document
               //document.Close();
               // stream the PDF to the user
               context.Response.OutputStream.Write(m.GetBuffer(), 0, m.GetBuffer().Length);
           }
           context.Response.End();
           //context.Response.Write("Hello");
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }

    }
}