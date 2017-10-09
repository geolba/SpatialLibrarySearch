using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GeoNames.Entities
{
    public class ResultLocation
    {
        public int id;
        public string name, featureClassName, featureClass, country, bundesland, distance, countryCode;
        public double lat, lon;
        public List<AlternativeName> alternateNames;
        public List<AdlibArticle> adlibArticles;
        public bool verifiziert;
        public int count;
        public string coordinatesCombinated;
    }
}