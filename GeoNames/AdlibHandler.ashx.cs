using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Adlib.Data;
using System.Xml;
using System.Text.RegularExpressions;
using GeoNames.Entities;
using System.Net;

namespace GeoNames
{
    /// <summary>
    /// Zusammenfassungsbeschreibung für AdlibHandler
    /// </summary>
    public class AdlibHandler : IHttpHandler
    {
        #region class members:

        private HttpResponse response;

        #endregion

        public void ProcessRequest(HttpContext context)
        {
            string geonamesUser = Configuration.GeonamesUser;
            response = context.Response;
            String jsonString = String.Empty;
            String countryArrayString = String.Empty;

            if (!String.IsNullOrEmpty(context.Request.QueryString["test"]))
            {
                jsonString = Convert.ToString(context.Request.QueryString["test"]);
            }
            else if (!String.IsNullOrEmpty(context.Request.Form["test"]))
            {
                jsonString = Convert.ToString(context.Request.Form["test"]);
            }

            if (!String.IsNullOrEmpty(context.Request.QueryString["countryArray"]))
            {
                countryArrayString = Convert.ToString(context.Request.QueryString["countryArray"]);
            }
            else if (!String.IsNullOrEmpty(context.Request.Form["countryArray"]))
            {
                countryArrayString = Convert.ToString(context.Request.Form["countryArray"]);
            }

            //.Net JavaScripSerializer -> Processing the result:
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            List<ResultLocation> _resultLocationList = serializer.Deserialize<List<ResultLocation>>(jsonString);      

            Dictionary<string, CountryCode> countryArray = serializer.Deserialize<List<CountryCode>>(countryArrayString).ToDictionary(x => x.iso_alpha2.ToLower(), x => x);         
            
            foreach (ResultLocation resultLocation in _resultLocationList)
            {
                //string url = "http://opac.geologie.ac.at/wwwopacx/wwwopac.ashx";
                string url = "https://opac.geologie.ac.at/wwwopacx/wwwopac.ashx";
                string database = "ChoiceFullCatalogue";                
                string CensoredText = String.Empty;
                const string PatternTemplate = @"\b({0})(s?)\b";
                const RegexOptions Options = RegexOptions.IgnoreCase;

                string[] badWords = new[] { "nach", "in", "im", "der", "die", "das", "am", "the" };
                IEnumerable<Regex> badWordMatchers = badWords.
                    Select(x => new Regex(string.Format(PatternTemplate, x), Options));
                string output = badWordMatchers.
                   Aggregate(resultLocation.name, (current, matcher) => matcher.Replace(current, CensoredText)).Trim();

                //var currSearchStat = "(geographical_keyword=" + listItem.name + " or title=" + listItem.name + ")";
                var currSearchStat = String.Empty;
                if (output.Contains("Sankt"))
                {
                    var output2 = output.Replace("Sankt", "St");
                    //currSearchStat = "geographical_keyword='" + output + "' or title='" + output + "' or geographical_keyword='" + output2 + "' or title='" + output2 + "'";
                    currSearchStat = "geographical_keyword='" + output + "' or title='" + output + "' or abstract='" + output + "' or geographical_keyword='" + output2 + "' or title='" + output2 + "' or abstract='" + output2 + "'";
                    
                }
                else if (output.Contains("St."))
                {
                    var output2 = output.Replace("St.", "Sankt");
                    currSearchStat = "geographical_keyword='" + output + "' or title='" + output + "' or geographical_keyword='" + output2 + "' or title='" + output2 + "'";
                    //currSearchStat = "geographical_keyword='" + output + "' or title='" + output + "' or abstract='" + output + "' or geographical_keyword='" + output2 + "' or title='" + output2 + "' or abstract='" + output2 + "'";
                   
                }
                else
                {
                    currSearchStat = "geographical_keyword='" + output + "' or title='" + output + "'";
                    //currSearchStat = "geographical_keyword='" + output + "' or title='" + output + "' or abstract='" + output + "'";
                }

                if (resultLocation.alternateNames.Count > 0)
                {
                    for (var j = 0; j < resultLocation.alternateNames.Count; j++)
                    {
                        //if the alternate name isn't the same as the placename
                        if (resultLocation.alternateNames[j].name != resultLocation.name)
                        {
                            currSearchStat += " or geographical_keyword='" + resultLocation.alternateNames[j].name + "' or title='" + resultLocation.alternateNames[j].name + "'";
                            //currSearchStat += " or geographical_keyword='" + resultLocation.alternateNames[j].name + "' or title='" + resultLocation.alternateNames[j].name + "' or abstract='" + resultLocation.alternateNames[j].name + "'";
                        }
                    }
                }
                //currSearchStat += ")";
                AdlibConnection conn;
                try
                {
                    // Create a connection to the wwwopac.ashx 
                    conn = new AdlibConnection(url);
                }
                catch (WebException)
                {
                    context.Response.Clear();
                    //Internal Server Error
                    context.Response.StatusCode = 500;
                    context.Response.Write("adlib error: " + "adlib server is unknown");
                    return;
                }
                catch (Exception)
                {
                    context.Response.Clear();
                    //Internal Server Error
                    //context.Response.StatusCode = 500;
                    context.Response.Write("adlib error");
                    return;
                }
                // Prepare a record set for results
               AdlibRecordSet recordSet = new AdlibRecordSet(conn, database);
                // Set the type of XML returned
                recordSet.XmlType = XmlType.Unstructured;
                recordSet.Limit = 100;
                // Do the search
                try
                {
                    recordSet.Search(currSearchStat);
                }
                //time exception:
                catch (Exception)
                {
                    continue;//go to the next resultLocation
                }
               
                if (recordSet.Hits == 0)
                {
                    continue; //go to the next resultLocation
                }                 
                else
                {
                    //ArrayList list = new ArrayList();
                    resultLocation.count = recordSet.Hits;
                    foreach (XmlNode record in recordSet.SelectNodes("adlibXML/recordList/record"))
                    {
                        AdlibArticle article = new AdlibArticle();
                        article.priref = record.Attributes["priref"].Value;
                        article.author = (record.SelectSingleNode("author.name") != null) ? record.SelectSingleNode("author.name").InnerText : string.Empty;
                        article.title = (record.SelectSingleNode("title") != null) ? record.SelectSingleNode("title").InnerText : string.Empty;
                        article.country = resultLocation.country.ToLower();
                        article.countryCode = resultLocation.countryCode;
                        article.bundesland = resultLocation.bundesland;
                        //article.vorwort = (record.SelectSingleNode("abstract") != null) ? record.SelectSingleNode("abstract").InnerText : string.Empty;                      

                        //geographical keywords
                        var list = record.SelectNodes("geographical_keyword");
                        article.geographicalKeywords = new List<string>();
                        foreach (XmlNode node in list)
                        {
                            
                            article.geographicalKeywords.Add(node.InnerText);
                        }

                        //pdfAvailable
                        if (record.SelectSingleNode("publication_number") != null && record.SelectSingleNode("publication_number").InnerText != String.Empty)
                        {
                            article.pdfName = record.SelectSingleNode("publication_number").InnerText;
                            article.pdfLink = "http://opac.geologie.ac.at/wwwopacx/wwwopac.ashx?command=getcontent&server=images&value=" + article.pdfName;
                            article.pdfAvailable = true;
                        }
                       else if (record.SelectSingleNode("digital_reference") != null && record.SelectSingleNode("digital_reference").InnerText != String.Empty)
                        {
                            article.pdfName = record.SelectSingleNode("digital_reference").InnerText;
                            article.pdfLink = article.pdfName;
                            article.pdfAvailable = true;
                        }
                        else
                        {
                             article.pdfName = string.Empty;
                             article.pdfAvailable = false;
                        }

                        //language codes
                        var languageList = record.SelectNodes("language_code");
                        article.languageCodes = new List<string>();
                        foreach (XmlNode node in languageList)
                        {
                            article.languageCodes.Add(node.InnerText);
                        }

                        //visibility: default all articles are visible
                        article.visible = true;

                       
                        CountryCode countryName;
                        if (countryArray.TryGetValue(article.countryCode.ToLower(), out countryName))
                        {
                            article.germanCountry = countryName.adlibDeutsch.ToLower();
                        }

                        //verify the article:
                        //string oesterreich = "österreich";
                        if (article.geographicalKeywords.Count > 0)
                        {
                            for (var ind = 0; ind < article.geographicalKeywords.Count; ind++)
                            {                                

                                var item = article.geographicalKeywords[ind];
                                //wenn das der deutsche Ländername Österreich ist und das geografische Schlagwort dem Attribut 'bundesland' entspricht
                                if (article.germanCountry == ("österreich").ToLower() && item.ToLower() == article.bundesland.ToLower())
                                {
                                    article.verifiziert = true;
                                    resultLocation.verifiziert = true;
                                    //escape the for-loop:
                                    break;
                                }
                                //außerhalb von Österreich müssen nur die Staaten übereinstimmen
                                if (article.germanCountry != ("österreich").ToLower() && item.ToLower() == article.germanCountry)
                                {
                                    article.verifiziert = true;
                                    resultLocation.verifiziert = true;
                                    //escape the for-loop:
                                    break;
                                }
                                if (article.country != article.germanCountry)
                                {
                                    //außerhalb von Österreich müssen nur die Staaten übereinstimmen
                                    if (item.ToLower() == article.germanCountry)
                                    {
                                        article.verifiziert = true;
                                        resultLocation.verifiziert = true;
                                        //escape the for-loop:
                                        break;
                                    }
                                }

                            }
                        }                  

                       

                        resultLocation.adlibArticles.Add(article);                      
                    }//foreach zu

                    //verifizierte Artikel nach vorne reihen:
                    //resultLocation.adlibArticles = resultLocation.adlibArticles.OrderByDescending(m => m.verifiziert).ToList();
                }//else zu
            }         

            //erzeugen der neuen List für die Location mit Adlib-Artikeln
            List<ResultLocation> _resultsLocationsAdlib = new List<ResultLocation>();
            _resultsLocationsAdlib = _resultLocationList.Where(v => v.adlibArticles.Count > 0).ToList();

            //"Eindeutigkeit überprüfen: unverifizoerte locations dürfen kein count > 10 haben
            foreach (ResultLocation r in _resultLocationList.Where(v => v.adlibArticles.Count > 0 && v.verifiziert == false).ToList())
            {
                var url = "http://ws.geonames.net/search?q=" + r.name + "&username="+ geonamesUser;
                var rootXml = System.Xml.Linq.XElement.Load(url);
                var simpleQuery = from simpleItem in rootXml.Descendants("geoname")
                                  select simpleItem;
                int totalResultsCount = simpleQuery.Count();
                if (totalResultsCount > 10)
                {
                    _resultsLocationsAdlib.Remove(r);
                }
            }


            //if points have the same coordinates, move their coordinates by 100 meters
            Dictionary<string, ResultLocation> foundResultLocations = new Dictionary<string,ResultLocation>();
            foreach (ResultLocation r in _resultsLocationsAdlib)
            {
                if (foundResultLocations.ContainsKey(r.coordinatesCombinated))
                {
                    //Position, decimal degrees
                     double lat = r.lat;
                     double lon = r.lon;
                     //Earth’s radius, sphere
                     double R=6378137;
                     //offsets in meters
                     double dn = 100;
                     double de = 100;
                     //Coordinate offsets in radians
                     double dLat = dn / R;
                     double dLon = de / (R * Math.Cos(Math.PI * lat / 180));
                     //OffsetPosition, decimal degrees
                     r.lat = lat + dLat * 180/Math.PI;
                     r.lon = lon + dLon * 180 / Math.PI;                   
                }
                else
                {
                    foundResultLocations.Add(r.coordinatesCombinated, r);
                }
            }

            //return the array incl. the adlibArticles:
            string str = serializer.Serialize(_resultsLocationsAdlib);
            response.Clear();
            response.ContentType = "application/json; charset=utf-8";
            response.Write(str.ToString());


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