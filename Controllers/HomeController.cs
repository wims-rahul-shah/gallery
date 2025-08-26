using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using YourNamespace.Data;

namespace YourNamespace.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly IHttpClientFactory _httpFactory;
        private readonly IConfiguration _config;
        private readonly ApplicationDbContext _db;

        public HomeController(IHttpClientFactory httpFactory, IConfiguration config, ApplicationDbContext db)
        {
            _httpFactory = httpFactory;
            _config = config;
            _db = db;
        }

        public IActionResult Index()
        {
            return View();
        }

        // ----------------- PARTIAL VIEWS FOR SIDEBAR LINKS -----------------
        public IActionResult Dashboard()
        {
            return PartialView("_dashboard");
        }

        public IActionResult PhotoLibrary()
        {
            return PartialView("_photoLibrary");
        }

        public IActionResult Users()
        {
            var users = _db.Users.ToList();
            return PartialView("_users", users);  // ✅ Pass users model to the partial
        }

        public IActionResult Email()
        {
            return PartialView("_email");
        }

        public IActionResult MusicLibrary()
        {
            return PartialView("_musicLibrary");
        }
        public IActionResult Games()
        {
            return PartialView("_games");
        }

        public IActionResult Widgets()
        {
            return PartialView("_widgets");
        }


        public IActionResult Snake()
        {
            return PartialView("_snake");
        }

        public IActionResult Tetris()
        {
            return PartialView("_tetris");
        }

        public IActionResult FlappyBird()
        {
            return PartialView("_flappyBird");
        }

        public IActionResult Quiz()
        {
            return PartialView("_quiz");
        }

        // ----------------- VIDEO LIBRARY -----------------
        public async Task<IActionResult> VideoLibrary(string q = "trending music video india")
        {
            var apiKey = _config["YouTube:ApiKey"];
            List<dynamic> list;

            if (!string.IsNullOrEmpty(apiKey))
            {
                var client = _httpFactory.CreateClient();
                var requestUrl = $"https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=24&q={System.Net.WebUtility.UrlEncode(q)}&key={apiKey}";
                var resp = await client.GetAsync(requestUrl);
                if (resp.IsSuccessStatusCode)
                {
                    var json = await resp.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(json);
                    list = new List<dynamic>();
                    foreach (var item in doc.RootElement.GetProperty("items").EnumerateArray())
                    {
                        var id = item.GetProperty("id").GetProperty("videoId").GetString();
                        var snip = item.GetProperty("snippet");
                        var title = snip.GetProperty("title").GetString();
                        var thumb = snip.GetProperty("thumbnails").GetProperty("high").GetProperty("url").GetString();
                        list.Add(new { Id = id, Title = title, Thumb = thumb });
                    }
                }
                else
                {
                    list = new List<dynamic>();
                }
            }
            else
            {
                // fallback static videos
                list = new List<dynamic>
                {
                    new { Id = "dQw4w9WgXcQ", Title = "Sample Video 1", Thumb = "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" },
                    new { Id = "3JZ_D3ELwOQ", Title = "Sample Video 2", Thumb = "https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg" }
                };
            }

            return PartialView("_videoLibrary", list);
        }

        public IActionResult Search(string q)
        {
            return RedirectToAction("VideoLibrary", new { q = q ?? "latest" });
        }

        [HttpPost]
        public IActionResult Email([FromBody] EmailRequest request)
        {
            try
            {
                var mail = new MailMessage();
                mail.From = new MailAddress("rahullrex@gmail.com");
                mail.To.Add("rahullrex786@gmail.com");
                mail.Subject = request.Subject;
                mail.Body = request.Body;

                var smtp = new SmtpClient("smtp.gmail.com", 587)
                {
                    Credentials = new NetworkCredential("rahullrex786@gmail.com", "oiws peub ykbp flsv"),
                    EnableSsl = true
                };

                smtp.Send(mail);

                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        public class EmailRequest
        {
            public string Subject { get; set; }
            public string Body { get; set; }
        }

        // ----------------- AI CHAT -----------------
        public IActionResult Chat()
        {
            return PartialView("_chat");
        }

        [HttpPost]
        public async Task<IActionResult> PostChat([FromBody] ChatRequest request)
        {
            try
            {
                var client = _httpFactory.CreateClient();
                client.BaseAddress = new Uri("https://openrouter.ai/api/v1/");
                client.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _config["OpenRouter:ApiKey"]);

                var body = new
                {
                    model = "deepseek/deepseek-chat-v3-0324",
                    messages = new[]
                    {
                new { role = "user", content = request.Message }
            }
                };

                var json = JsonSerializer.Serialize(body);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var resp = await client.PostAsync("chat/completions", content);
                resp.EnsureSuccessStatusCode();

                var responseJson = await resp.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseJson);
                var reply = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                return Json(new { success = true, reply });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        public class ChatRequest
        {
            public string Message { get; set; }
        }

        // ----------------- NEWS SECTION -----------------
        public async Task<IActionResult> News(string q = "India")
        {
            var apiKey = _config["NewsData:ApiKey"];
            var client = _httpFactory.CreateClient();

            var url = $"https://newsdata.io/api/1/news?apikey={apiKey}&q={WebUtility.UrlEncode(q)}&country=in&language=en";

            var resp = await client.GetAsync(url);
            List<NewsArticle> articles = new();

            if (resp.IsSuccessStatusCode)
            {
                var json = await resp.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                if (doc.RootElement.TryGetProperty("results", out var results))
                {
                    foreach (var item in results.EnumerateArray())
                    {
                        var title = item.GetProperty("title").GetString();
                        var link = item.GetProperty("link").GetString();
                        var image = item.TryGetProperty("image_url", out var imgProp) ? imgProp.GetString() : null;
                        var source = item.TryGetProperty("source_id", out var srcProp) ? srcProp.GetString() : null;

                        articles.Add(new NewsArticle
                        {
                            Title = title,
                            Url = link,
                            Image = image,
                            Source = source
                        });
                    }
                }
            }

            // Pass query back to ViewBag for showing in search box
            ViewBag.Query = q;

            return PartialView("_news", articles);
        }

        public class NewsArticle
        {
            public string Title { get; set; }
            public string Url { get; set; }
            public string Image { get; set; }
            public string Source { get; set; }
        }

    }
}

