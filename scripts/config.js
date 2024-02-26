import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth } from "./firebase.js";

export const TMDB_API_KEY = "9b7c3ede447b14c5e0e9d33a137ddac9";

addEventListener("scroll", () => {
  if (window.scrollY === 0) {
    document
      .querySelector(".navbar")
      .classList.remove("navbar-background-visible");
  } else {
    document
      .querySelector(".navbar")
      .classList.add("navbar-background-visible");
  }
});

window.handleSignOut = () => {
  signOut(auth);
  location.reload();
};

window.signIn = () => {
  signInWithPopup(auth, new GoogleAuthProvider());
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.querySelector("#avatar-action-container").innerHTML = /*html*/ `
  <div tabindex="0" class="avatar-action">
    <img src="${
      user.photoURL ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        user.displayName
      )}`
    }" />
    <div class="popup">
      <button class="action-button" onclick="handleSignOut()">
        <i class="fa-solid fa-right-from-bracket"></i>
        <span> Logout</span>
      </button>
    </div>
  </div>
`;
  } else {
    document.querySelector("#avatar-action-container").innerHTML = /*html*/ `
    <i onclick="signIn()" style="cursor: pointer; font-size: 25px" class="fa-solid fa-right-to-bracket"></i>
`;
  }
});
