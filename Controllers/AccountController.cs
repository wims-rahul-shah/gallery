using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Security.Claims;
using YourNamespace.Data;
using YourNamespace.Models;

public class AccountController : Controller
{
    private readonly ApplicationDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AccountController(ApplicationDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    [HttpGet]
    public IActionResult Login() => View();

    [HttpPost]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleTokenRequest request)
    {
        var payload = await GoogleJsonWebSignature.ValidateAsync(request.Token);

        // Check if user exists in DB
        var user = _db.Users.FirstOrDefault(u => u.GoogleId == payload.Subject);
        if (user == null)
        {
            user = new User
            {
                //Id=1,
                Name = payload.Name,
                Email = payload.Email,
                GoogleId = payload.Subject,
                Picture = payload.Picture
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            var httpClient = new HttpClient();
            var bytes = await httpClient.GetByteArrayAsync(user.Picture);
            System.IO.File.WriteAllBytes($"wwwroot/images/{user.Email}.jpg", bytes);
            
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, payload.Subject),
            new Claim(ClaimTypes.Name, payload.Name ?? ""),
            new Claim(ClaimTypes.Email, payload.Email ?? ""),
            new Claim("picture", payload.Picture ?? "")
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        if (!string.IsNullOrEmpty(request.AccessToken))
            HttpContext.Session.SetString("GoogleAccessToken", request.AccessToken);

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

        return Json(new { success = true});
    }

    [HttpPost]
    public async Task<IActionResult> DefaultLogin([FromForm] string username, [FromForm] string password)
    {
        // Simple default login check
        if (username == "admin@google.com" && password == "admin@1997")
        {
            var claims = new[]
            {
            new Claim(ClaimTypes.NameIdentifier, "admin"),
            new Claim(ClaimTypes.Name, "Administrator"),
            new Claim(ClaimTypes.Email, "admin@google.com"),

        };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

            // Store session info if needed
            HttpContext.Session.SetString("DefaultLogin", "true");

            return RedirectToAction("Index", "Home");
        }

        // Invalid credentials
        TempData["LoginError"] = "Invalid username or password!";
        return RedirectToAction("Login");
    }


    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        HttpContext.Session.Clear();
        return RedirectToAction("Login");
    }
}

public class GoogleTokenRequest
{
    public string Token { get; set; }
    public string AccessToken { get; set; }
}
