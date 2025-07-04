document.addEventListener("DOMContentLoaded", () => {
	const navToggle = document.getElementById("nav-toggle");
	const mainNav = document.getElementById("main-nav");

	if (navToggle && mainNav) {
		navToggle.addEventListener("click", () => {
			mainNav.classList.toggle("nav--visible");
			navToggle.classList.toggle("is-active");
		});
	}

	const animatedElements = document.querySelectorAll(".fade-in");

	if (animatedElements.length > 0) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-visible");
						observer.unobserve(entry.target);
					}
				});
			},
			{
				threshold: 0.1,
			}
		);

		animatedElements.forEach((element) => {
			observer.observe(element);
		});
	}
});
