const TMDB_API_KEY = "9b7c3ede447b14c5e0e9d33a137ddac9";

addEventListener("scroll", () => {
  if (window.scrollY === 0) {
    document.querySelector(".navbar").style.background = "transparent";
  } else {
    document.querySelector(".navbar").style.background = "var(--dark)";
  }
});
