using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GeoNames.Entities
{
    public class AdlibArticle
    {
        public string author, title, priref, country, germanCountry, bundesland, countryCode, vorwort;
        public bool verifiziert, pdfAvailable, visible;
        public string pdfName, pdfLink;
        public List<string> geographicalKeywords;
        public List<string> languageCodes;
    }
}