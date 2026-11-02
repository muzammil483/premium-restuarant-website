// =====================================
// THE GRAND TABLE - Main JavaScript
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    const header = document.getElementById("header");
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");
    const toggleIcon = menuToggle.querySelector("i");


    // 1. MOBILE NAVIGATION

    function setMenu(open) {
        navMenu.classList.toggle("open", open);
        document.body.classList.toggle("nav-open", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
        toggleIcon.className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
    }

    menuToggle.addEventListener("click", () => {
        setMenu(!navMenu.classList.contains("open"));
    });

    navMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("click", (e) => {
        if (
            navMenu.classList.contains("open") &&
            !navMenu.contains(e.target) &&
            !menuToggle.contains(e.target)
        ) {
            setMenu(false);
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) setMenu(false);
    });


    // 2. HEADER SHADOW ON SCROLL

    function onScroll() {
        header.classList.toggle("scrolled", window.scrollY > 40);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();


    // 3. MENU CATEGORY FILTER

    const filterButtons = document.querySelectorAll(".filter-btn");
    const menuCards = document.querySelectorAll(".menu-card");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
                btn.setAttribute("aria-pressed", "false");
            });

            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");

            const selected = button.dataset.filter;

            menuCards.forEach(card => {
                const show = selected === "all" || card.dataset.category === selected;
                card.classList.toggle("hidden", !show);
            });

        });
    });


    // 4. RESERVATION FORM

    const form = document.getElementById("reservationForm");
    const formMessage = document.getElementById("formMessage");
    const dateInput = document.getElementById("date");
    const timeInput = document.getElementById("time");

    const defaultNote = "Your reservation request will open in WhatsApp.";
    const restaurantNumber = "923363430483"; // Replace with actual WhatsApp number

    function getToday() {
        const now = new Date();
        return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .split("T")[0];
    }

    dateInput.min = getToday();

    function showMessage(text, type) {
        formMessage.textContent = text;
        formMessage.className = "form-note" + (type ? " " + type : "");
    }

    function markInvalid(field, isInvalid) {
        field.classList.toggle("invalid", isInvalid);
    }

    // Clear errors while typing
    form.querySelectorAll("input, select, textarea").forEach(field => {
        field.addEventListener("input", () => {
            markInvalid(field, false);
            showMessage(defaultNote, "");
        });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = form.name.value.trim();
        const phone = form.phone.value.trim();
        const date = dateInput.value;
        const time = timeInput.value;
        const guests = form.guests.value;
        const message = form.message.value.trim();

        form.querySelectorAll(".invalid").forEach(f => f.classList.remove("invalid"));

        // Required fields
        const missing = [
            [form.name, name],
            [form.phone, phone],
            [dateInput, date],
            [timeInput, time],
            [form.guests, guests]
        ].filter(([, value]) => !value);

        if (missing.length) {
            missing.forEach(([field]) => markInvalid(field, true));
            missing[0][0].focus();
            showMessage("Please complete all required fields.", "error");
            return;
        }

        // Name
        if (name.length < 3) {
            markInvalid(form.name, true);
            form.name.focus();
            showMessage("Please enter your full name.", "error");
            return;
        }

        // Phone: 10-15 digits, only valid characters
        const digits = phone.replace(/\D/g, "");

        if (!/^[+\d\s()-]+$/.test(phone) || digits.length < 10 || digits.length > 15) {
            markInvalid(form.phone, true);
            form.phone.focus();
            showMessage("Please enter a valid phone number.", "error");
            return;
        }

        // Date
        if (date < getToday()) {
            markInvalid(dateInput, true);
            dateInput.focus();
            showMessage("Please select today's date or a future date.", "error");
            return;
        }

        // Time within opening hours
        if (time < "12:00" || time > "23:00") {
            markInvalid(timeInput, true);
            timeInput.focus();
            showMessage("Please choose a time between 12:00 PM and 11:00 PM.", "error");
            return;
        }

        // Past time today
        if (date === getToday()) {
            const now = new Date();
            const current =
                String(now.getHours()).padStart(2, "0") + ":" +
                String(now.getMinutes()).padStart(2, "0");

            if (time <= current) {
                markInvalid(timeInput, true);
                timeInput.focus();
                showMessage("Please choose a time later than now.", "error");
                return;
            }
        }

        // Build WhatsApp message
        const text = `Hello The Grand Table!

I would like to reserve a table.

Name: ${name}
Phone: ${phone}
Date: ${date}
Time: ${time}
Guests: ${guests}

Special Request: ${message || "None"}

Please confirm my reservation.

Thank you!`;

        const url = `https://wa.me/${restaurantNumber}?text=${encodeURIComponent(text)}`;

        // Anchor click works reliably on mobile browsers
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        link.remove();

        showMessage("Opening WhatsApp. Please press Send to confirm your request.", "success");
        form.reset();
    });


    // 5. COPYRIGHT YEAR

    document.getElementById("currentYear").textContent = new Date().getFullYear();


    // 6. ACTIVE NAV LINK ON SCROLL

    const navLinks = document.querySelectorAll(".nav-link");
    const watched = document.querySelectorAll("main section[id], footer[id]");

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.toggle(
                        "active",
                        link.getAttribute("href") === `#${entry.target.id}`
                    );
                });
            }
        });
    }, { rootMargin: "-30% 0px -60% 0px" });

    watched.forEach(el => navObserver.observe(el));


    // 7. SCROLL REVEAL ANIMATION

    const revealItems = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealItems.forEach((item, i) => {
            item.style.transitionDelay = `${(i % 3) * 90}ms`;
            revealObserver.observe(item);
        });
    } else {
        revealItems.forEach(item => item.classList.add("visible"));
    }


    // 8. GALLERY LIGHTBOX

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxClose = document.getElementById("lightboxClose");
    let lastFocused = null;

    function openLightbox(img) {
        lastFocused = document.activeElement;
        lightboxImg.src = img.src.replace("w=900", "w=1600");
        lightboxImg.alt = img.alt;
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
        lightboxClose.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove("open");
        document.body.style.overflow = "";
        lightboxImg.src = "";
        if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll(".gallery-grid img").forEach(img => {
        img.addEventListener("click", () => openLightbox(img));
        img.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openLightbox(img);
            }
        });
    });

    lightboxClose.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });


    // 9. ESCAPE KEY (menu + lightbox)

    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;

        if (lightbox.classList.contains("open")) closeLightbox();
        if (navMenu.classList.contains("open")) setMenu(false);
    });

});