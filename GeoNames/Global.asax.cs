using System;
using System.Net;

namespace GeoNames
{
    public class Global : System.Web.HttpApplication
    {

        protected void Application_Start(object sender, EventArgs e)
        {
            //ServicePointManager.ServerCertificateValidationCallback = (sender1, certificate, chain, sslPolicyErrors) => true;
            System.Net.ServicePointManager.SecurityProtocol |= SecurityProtocolType.Tls12;
        }
      
    }
}