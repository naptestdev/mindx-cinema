const searchQuery = new URLSearchParams(location.search);

const movieId = searchQuery.get("id");

if (!movieId) location.href = "./index.html";

const labels = ["data", "similar"];

(async () => {
  const result = (
    await Promise.all([
      (
        await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`
        )
      ).json(),
      (
        await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${TMDB_API_KEY}`
        )
      ).json(),
    ])
  ).reduce((final, current, index) => {
    if (labels[index] === "data") {
      final[labels[index]] = current;
    } else if (labels[index] === "similar") {
      final[labels[index]] = current.results;
    }

    return final;
  }, {});

  console.log(result);

  document.querySelector(
    "iframe"
  ).src = `https://www.2embed.cc/embed/${result.data.id}`;
  document.querySelector("#movie-title").innerText =
    result.data.title || result.data.name;
  document.querySelector("#movie-description").innerText = result.data.overview;

  if (result.data.release_date)
    document.querySelector(
      "#release-date"
    ).innerText = `Release Date: ${result.data.release_date}`;

  if (result.similar && result.similar.length > 0)
    document.querySelector("#similar").innerHTML += /*html*/ `
    <h1 className="text-xl">Similar Movies</h1>
    ${result.similar
      .map(
        (item) => /*html*/ `<a href="./info.html?id=${item.id}">
          <div>
            <img
              onload="this.style.opacity = '1'"
              alt=""
              src="https://image.tmdb.org/t/p/w200${item.poster_path}"
            />
            <div>
              <p>${item.title}</p>
            </div>
          </div>
        </a>`
      )
      .join("")} 
  `;

  document.querySelector(".backdrop").style.opacity = 0;
  document.querySelector(".backdrop").style.visibility = "hidden";

  document.title = `Watch ${
    result.data.title || result.data.name
  } - MindX Cinema`;
})();
