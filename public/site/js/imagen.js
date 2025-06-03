document.addEventListener("DOMContentLoaded", () => {
  const foto = localStorage.getItem("userPhoto");
  if (foto) {
    const logoLink = document.querySelector("a.img.logo.rounded-circle.mb-5");
    if (logoLink) {
      logoLink.style.backgroundImage = `url(${foto})`;
    }
  }
});
