using System.Collections.Generic;

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