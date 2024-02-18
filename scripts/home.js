addEventListener("scroll", () => {
  if (window.scrollY === 0) {
    document.querySelector(".navbar").style.background = "transparent";
  } else {
    document.querySelector(".navbar").style.background = "var(--dark)";
  }
});

(async () => {
  const HomeAPIRoutes = {
    "Trending Movies": { url: "/trending/movie/week", media_type: "movie" },
    "Popular Movies": { url: "/movie/popular", media_type: "movie" },
    "Top Rated Movies": { url: "/movie/top_rated", media_type: "movie" },
    "Trending TV": { url: "/trending/tv/week", media_type: "tv" },
    "Popular TV": { url: "/tv/popular", media_type: "tv" },
    "Top Rated TV": { url: "/tv/top_rated", media_type: "tv" },
  };

  const promises = await Promise.all(
    Object.keys(HomeAPIRoutes).map(
      async (item) =>
        await (
          await fetch(
            `https://api.themoviedb.org/3${HomeAPIRoutes[item].url}?api_key=${TMDB_API_KEY}`
          )
        ).json()
    )
  );

  const data = promises.reduce((final, current, index) => {
    final[Object.keys(HomeAPIRoutes)[index]] = current.results.map((item) => ({
      ...item,
      media_type: HomeAPIRoutes[Object.keys(HomeAPIRoutes)[index]].media_type,
    }));
    return final;
  }, {});

  const trending = data["Trending Movies"];

  const main = trending[new Date().getDate() % trending.length];

  document.querySelector(".backdrop").style.opacity = 0;
  document.querySelector(".backdrop").style.visibility = "hidden";

  document.querySelector(
    "#hero-image"
  ).src = `https://image.tmdb.org/t/p/original${main.backdrop_path}`;
  document.querySelector(
    "#hero-preview-image"
  ).src = `https://image.tmdb.org/t/p/w300${main.poster_path}`;
  document.querySelector("#hero-title").innerText = main.title || main.name;
  document.querySelector("#hero-description").innerText = main.overview;

  Object.keys(data).map((key, index) => {
    document.querySelector("main").innerHTML += `
    <div class="section">
      <h2>${key}</h2>

      <div class="swiper-${index} swiper">
        <div class="swiper-wrapper">
          ${data[key]
            .map(
              (item) => `
          <a href="#" class="swiper-slide" style="width: 200px !important">
            <div class="movie-card">
              <img
                class="fade-in"
                onload="this.style.opacity = '1'"
                src="https://image.tmdb.org/t/p/w200${item.poster_path}"
                alt=""
              />
              <p class="multiline-ellipsis-2">
                ${item.title || item.name}
              </p>
            </div>
          </a>
        `
            )
            .join("\n")} 
        </div>
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
      </div>
    </div>
    `;
  });
  Object.keys(data).map((key, index) => {
    new Swiper(`.swiper-${index}`, {
      spaceBetween: 30,
      autoplay: { delay: 5000, disableOnInteraction: true },
      slidesPerView: "auto",
      loop: true,
      slidesPerGroupAuto: true,
      navigation: {
        prevEl: `.swiper-button-prev`,
        nextEl: `.swiper-button-next`,
      },
    });
  });
})();
