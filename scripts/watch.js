import { TMDB_API_KEY } from "./config.js";
import { auth, db } from "./firebase.js";
import {
  query,
  collection,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const calculateElapsedTime = (timeCreated) => {
  const created = new Date(timeCreated).getTime();
  let periods = {
    year: 365 * 30 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
  };
  let diff = Date.now() - created;

  for (const key in periods) {
    if (diff >= periods[key]) {
      let result = Math.floor(diff / periods[key]);
      return `${result} ${result === 1 ? key : key + "s"} ago`;
    }
  }

  return "Just now";
};

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

  // document.querySelector(
  //   "iframe"
  // ).src = `https://www.2embed.cc/embed/${result.data.id}`;
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

  onAuthStateChanged(auth, (user) => {
    document.querySelector("#comment-box-container").innerHTML = /*html*/ `
  <form ${
    !user ? 'style="cursor: pointer" onclick="signIn()"' : ""
  } class="comment-form" autocomplete="off">
    <img src="${
      user
        ? user?.photoURL ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            user?.displayName
          )}`
        : `https://cdn.jsdelivr.net/gh/napthedev/cmtio/public/default-avatar.png`
    }" />

    <div >
      <input
        required
        type="text"
        placeholder="${
          user ? `Comment as ${user.displayName}` : "Sign in to comment"
        }"
        id="comment"
        name="comment"
        ${user ? "" : "style='pointer-events: none'"}
      />
      <button type="submit"
        ${user ? "" : 'style="display: none"'}
       ><i class="fa-solid fa-paper-plane"></i></button>
    </div>
  </form>
  `;

    const form = document.querySelector("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = e.target.comment.value.trim();

      e.target.comment.value = "";

      addDoc(collection(db, `movie-comments-${movieId}`), {
        title,
        user: {
          uid: auth.currentUser.uid,
          displayName: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL,
          email: auth.currentUser.email,
        },
        createdAt: serverTimestamp(),
      }).catch((err) => {
        console.log(err);
        alert("Failed to comment", err);
      });
    });
  });

  const q = query(
    collection(db, `movie-comments-${movieId}`),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (querySnapshot) => {
    const comments = [];

    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });

      let out = "";

      comments.forEach((comment) => {
        out += /*html*/ `
        <div class="comment-item">
          <img src="${
            comment.user.photoURL ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              comment.user.displayName
            )}`
          }" />
          <div>
            <div>
              <strong>${comment.user.displayName}</strong>
              <p>${comment.title}</p>
            </div>
           <p>${calculateElapsedTime(
             comment.createdAt?.seconds
               ? comment.createdAt.seconds * 1000
               : Date.now()
           )}</p>
          </div>
        </div> 
      `;
      });

      document.querySelector("#comments").innerHTML = out;
    });
  });

  document.querySelector(".backdrop").classList.add("backdrop-hidden");

  document.title = `Watch ${
    result.data.title || result.data.name
  } - MindX Cinema`;
})();
