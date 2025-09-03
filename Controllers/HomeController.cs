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
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

        // Default links
        var links = new List<(string Id, string Name)>
{
    ("1abcDefaultFolderID", "Default Folder 1"),
    ("1xyzDefaultFolderID", "Default Folder 2")
};

        if (!string.IsNullOrEmpty(email))
        {
            if (email.Equals("rahullrex786@gmail.com", StringComparison.OrdinalIgnoreCase) ||
                email.Equals("rg2927182@gmail.com", StringComparison.OrdinalIgnoreCase))
            {
                // Special set of links for xyz / abc
                links = new List<(string Id, string Name)>
        {
            ("1nJee7mQFFNIu4CosqHuYul3Ifj__wps9", "Priti Pics"),
            ("1nElVG_2L-73DARWhMPNC5BTTXGcZU7fV", "Priti Snaps"),
            ("1O4WPWXzgTUIvNYiIwYmdgZy4bmGi_qvM", "Videos"),
            ("1OAHWr0S99pqHHQu6eFSLzIf7oy2LAHfY", "Priti Edits"),
            ("1ew_edA-Xktv9fo_qKk7cgP3tvUecLovQ", "Documents"),
            ("1zT-vqDuOl5k0G8CBQGeWiJU63vCWacK4", "Favorites"),
            ("1nOkFVANqq-0FjNe22ZhGKwae7Xfw057j", "Items"),
            ("1nQsdRJnHQyldSjQPDWGzZkZk5RnSOjJz", "Mehendi")
        };
            }
            else
            {
                // Other users → show different set of links
                links = new List<(string Id, string Name)>
        {
            ("1s8K2NmYFt7RcERiSBkRtelpI6VDUWAdl", "Designs"),
            ("1MsRAXGDgCkUAz9_qfHuh-GRhukNSyupr", "Gen AI"),
            ("12ovPVJ4SR6JxRI9n6AaBFRwWsO0TczAb", "High Quality"),
            ("1hP09us16R3NqeKbxz9z7zWYdWSzojVxd", "Logos"),
            ("18bU4qRk1Go45vApTmqQoPyuBkXAk4lNL", "Scenery"),
            ("1z_Szz6pMKhM0t1W4cnniAZwN9KyRwHjg", "Space"),
            ("1UjNkYEZ5oTwnCjIvOh7XGuNxMqe56Vb8", "Wallpapers"),
            ("1_zBtYCXvfe5Hio27sHSxmtGd2bgE-d5R", "Windows 8K")
        };
            }
        }

        return PartialView("_photoLibrary", links);
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


