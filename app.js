const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    siteNav.classList.toggle("open");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
    });
  });
}

const sectionAnchors = document.querySelectorAll('main section[id]');
const navAnchors = document.querySelectorAll('.site-nav a[href^="#"]');
const miniCta = document.querySelector(".mini-cta");

if (sectionAnchors.length && navAnchors.length) {
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const id = entry.target.getAttribute("id");
        if (!id) {
          return;
        }

        navAnchors.forEach((anchor) => {
          anchor.classList.toggle("active", anchor.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-35% 0px -50% 0px", threshold: 0.05 }
  );

  sectionAnchors.forEach((section) => activeObserver.observe(section));

  if (miniCta) {
    const registerSection = document.querySelector("#register");
    if (registerSection) {
      const ctaObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            miniCta.classList.toggle("hidden", entry.isIntersecting);
          });
        },
        { threshold: 0.2 }
      );

      ctaObserver.observe(registerSection);
    }
  }
}

const revealItems = document.querySelectorAll(".reveal");

if (revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const interestForm = document.querySelector("#interest-form");

if (interestForm) {
  const status = document.querySelector("#form-status");
  const trackedFields = interestForm.querySelectorAll("input[required], select[required], textarea[required]");

  const clearFieldState = (field) => {
    field.classList.remove("invalid");
    field.removeAttribute("aria-invalid");
  };

  trackedFields.forEach((field) => {
    field.addEventListener("input", () => clearFieldState(field));
    field.addEventListener("change", () => clearFieldState(field));
  });

  interestForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const honeypot = interestForm.querySelector('input[name="company_website"]');
    if (honeypot && honeypot.value.trim()) {
      return;
    }

    let hasError = false;

    trackedFields.forEach((field) => {
      if (!field.checkValidity()) {
        field.classList.add("invalid");
        field.setAttribute("aria-invalid", "true");
        hasError = true;
      }
    });

    if (hasError) {
      if (status) {
        status.className = "form-status error";
        status.textContent = "Please complete all required fields and use a valid work email.";
      }
      return;
    }

    const formData = new FormData(interestForm);
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const org = (formData.get("organization") || "").toString().trim();
    const role = (formData.get("role") || "").toString().trim();
    const interestType = (formData.get("interest_type") || "").toString().trim();
    const message = (formData.get("message") || "").toString().trim();
    const consent = formData.get("consent") ? "Yes" : "No";

    if (status) {
      status.className = "form-status";
      status.textContent = "Sending your request...";
    }

    const payload = {
      name,
      email,
      organization: org,
      role,
      interest_type: interestType,
      consent,
      message,
      _subject: `SciOptimus Interest Registration - ${org || name}`,
      _captcha: "false",
      _template: "table",
    };

    try {
      const response = await fetch("https://formsubmit.co/ajax/admin@scioptimus.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      if (status) {
        status.className = "form-status success";
        status.textContent = "Request sent successfully. Our team will reach out shortly.";
      }

      interestForm.reset();
      trackedFields.forEach((field) => clearFieldState(field));
    } catch (_error) {
      if (status) {
        status.className = "form-status error";
        status.textContent = "We could not submit right now. Please try again in a moment.";
      }
    }
  });
}
