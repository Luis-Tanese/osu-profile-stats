document.addEventListener("DOMContentLoaded", () => {
	const navToggle = document.getElementById("nav-toggle");
	const mainNav = document.getElementById("main-nav");

	if (navToggle && mainNav) {
		navToggle.addEventListener("click", () => {
			mainNav.classList.toggle("nav--visible");
			navToggle.classList.toggle("is-active");
		});
	}

	const sections = document.querySelectorAll(".api-content section");
	const navLinks = document.querySelectorAll(".api-nav a");

	if (sections.length > 0 && navLinks.length > 0) {
		const observerOptions = {
			rootMargin: "-100px 0px -50% 0px",
			threshold: 0,
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					navLinks.forEach((link) => {
						link.classList.remove("active");
						if (link.getAttribute("href").substring(1) === entry.target.id) {
							link.classList.add("active");
						}
					});
				}
			});
		}, observerOptions);

		sections.forEach((section) => {
			observer.observe(section);
		});
	}

	const animatedElements = document.querySelectorAll(".fade-in");

	if (animatedElements.length > 0) {
		const animationObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-visible");
						animationObserver.unobserve(entry.target);
					}
				});
			},
			{
				threshold: 0.1,
			}
		);

		animatedElements.forEach((element) => {
			animationObserver.observe(element);
		});
	}
});
