using System;
using System.IO;
using System.Web;
using System.Net;

namespace GeoNames
{
    /// <summary>
    /// Summary description for http_proxy
    /// </summary>
    public class http_proxy : IHttpHandler
    {
        
        public void ProcessRequest(HttpContext context)
        {
            string webServiceUrl = context.Request["url"].ToString();

            System.Net.HttpWebRequest req = (System.Net.HttpWebRequest)System.Net.HttpWebRequest.Create(webServiceUrl);
            req.Method = context.Request.HttpMethod;
            req.ServicePoint.Expect100Continue = false;
            req.Referer = context.Request.Headers["referer"];

            // Set body of request for POST requests
            if (context.Request.InputStream.Length > 0)
            {
                byte[] bytes = new byte[context.Request.InputStream.Length];
                context.Request.InputStream.Read(bytes, 0, (int)context.Request.InputStream.Length);
                req.ContentLength = bytes.Length;

                string ctype = context.Request.ContentType;
                if (String.IsNullOrEmpty(ctype))
                {
                    req.ContentType = "application/x-www-form-urlencoded";
                }
                else
                {
                    req.ContentType = ctype;
                }

                using (Stream outputStream = req.GetRequestStream())
                {
                    outputStream.Write(bytes, 0, bytes.Length);
                }
            }
            else
            {
                req.Method = "GET";
            }

            WebResponse resp = req.GetResponse();
            Stream respStream = resp.GetResponseStream();
            StreamReader r = new StreamReader(respStream);
            // process SOAP return doc here. For now, we'll just send the XML out to the browser ...
            string output = r.ReadToEnd();
            context.Response.Write(output);
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