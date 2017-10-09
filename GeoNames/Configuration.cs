using System.Configuration;

namespace GeoNames
{
    public class Configuration
    {
        public static string GeonamesUser
        {
            get
            {
                return ConfigurationManager.AppSettings["geonamesuser"];
            }
        }
    }
}