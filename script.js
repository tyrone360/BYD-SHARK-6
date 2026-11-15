document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // 1. SWIPE-TO-ENTER EXPERIENCE
    // =====================================

    const welcomeScreen = document.getElementById("welcomeScreen");
    const enterButton = document.getElementById("enterButton");
    const showroom = document.getElementById("showroom");

    let entered = false;

const swipeTrack = document.getElementById("swipeTrack");
const swipeHandle = document.getElementById("enterButton");
const swipeProgress = document.getElementById("swipeProgress");
const swipeText = document.getElementById("swipeText");

function enterShowroom() {
    if (entered) return;

    entered = true;
    welcomeScreen.classList.add("exit");

    setTimeout(() => {
        welcomeScreen.style.display = "none";
        showroom.classList.remove("hidden");

        document.body.style.overflowX = "hidden";

        initializeRevealAnimations();
    }, 850);
}

let dragging = false;
let dragStartX = 0;
let handleStartX = 0;
let currentHandleX = 0;

function getMaximumSlide() {
    return swipeTrack.clientWidth - swipeHandle.offsetWidth - 12;
}

function updateSlider(position) {
    const maxSlide = getMaximumSlide();

    currentHandleX = Math.max(0, Math.min(position, maxSlide));

    swipeHandle.style.left = (6 + currentHandleX) + "px";
    swipeProgress.style.width =
        (currentHandleX + swipeHandle.offsetWidth / 2 + 6) + "px";

    const percentage = maxSlide > 0
        ? currentHandleX / maxSlide
        : 0;

    swipeText.style.opacity = Math.max(0.15, 1 - percentage * 1.3);
}

function resetSlider() {
    dragging = false;
    swipeHandle.style.transition =
        "left .35s ease, box-shadow .2s ease";
    swipeProgress.style.transition = "width .35s ease";
    swipeText.style.transition = "opacity .25s ease";

    updateSlider(0);

    swipeText.textContent = "SLIDE TO EXPLORE";

    setTimeout(() => {
        swipeHandle.style.transition = "";
        swipeProgress.style.transition = "";
        swipeText.style.transition = "";
    }, 380);
}

swipeHandle.addEventListener("pointerdown", (event) => {
    if (entered) return;

    dragging = true;
    dragStartX = event.clientX;
    handleStartX = currentHandleX;

    swipeHandle.setPointerCapture(event.pointerId);
});

swipeHandle.addEventListener("pointermove", (event) => {
    if (!dragging || entered) return;

    const distance = event.clientX - dragStartX;

    updateSlider(handleStartX + distance);

    if (currentHandleX / getMaximumSlide() >= 0.55) {
        swipeText.textContent = "KEEP SLIDING...";
    } else {
        swipeText.textContent = "SLIDE TO EXPLORE";
    }
});

swipeHandle.addEventListener("pointerup", () => {
    if (!dragging || entered) return;

    dragging = false;

    const maxSlide = getMaximumSlide();

    if (maxSlide > 0 && currentHandleX >= maxSlide * 0.82) {
        updateSlider(maxSlide);
        swipeText.textContent = "WELCOME TO THE EXPERIENCE";

        setTimeout(enterShowroom, 180);
    } else {
        resetSlider();
    }
});

swipeHandle.addEventListener("pointercancel", resetSlider);

swipeHandle.addEventListener("click", (event) => {
    // Keyboard activation still works.
    if (event.detail === 0 && !entered) {
        enterShowroom();
    }
});
// =====================================
    // 2. SCROLL REVEAL ANIMATIONS
    // =====================================

    function initializeRevealAnimations() {

        const revealElements = document.querySelectorAll(
            ".section-heading, .feature-card, .adventure-card, .technology-card, .vehicle-preview"
        );

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            revealElements.forEach(element => {
                element.classList.add("visible");
            });
            return;
        }

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -35px 0px"
        });

        revealElements.forEach(element => {
            element.classList.add("reveal");
            observer.observe(element);
        });
    }


    // =====================================
    // 3. VEHICLE COLOUR SELECTOR
    // =====================================

    const vehicleImage = document.getElementById("vehicleColourImage");
    const colourButtons = document.querySelectorAll(".colour-choice");
    const selectedColour = document.getElementById("selectedColour");

    colourButtons.forEach(button => {

        button.addEventListener("click", () => {

            const newImage = button.dataset.image;
            const colourName = button.dataset.colour;

            if (!newImage || !colourName) return;

            vehicleImage.style.opacity = "0";

            const imageLoader = new Image();

            imageLoader.onload = () => {
                vehicleImage.src = newImage;
                vehicleImage.style.opacity = "1";
            };

            imageLoader.onerror = () => {
                vehicleImage.style.opacity = "1";
                console.error("Unable to load vehicle image:", newImage);
            };

            imageLoader.src = newImage;

            colourButtons.forEach(item => {
                item.classList.remove("active");
                item.setAttribute("aria-pressed", "false");
            });

            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");

            selectedColour.textContent = "SELECTED: " + colourName.toUpperCase();
        });

        button.setAttribute(
            "aria-pressed",
            button.classList.contains("active") ? "true" : "false"
        );
    });


    // =====================================
    // 4. DARK / LIGHT THEME
    // =====================================

    const themeToggle = document.getElementById("themeToggle");

    function applyTheme(theme) {

        const isLight = theme === "light";

        document.body.classList.toggle("light-theme", isLight);

        themeToggle.textContent = isLight ? "☀" : "◐";

        themeToggle.setAttribute(
            "aria-label",
            isLight ? "Switch to dark theme" : "Switch to light theme"
        );
    }

    let savedTheme = "dark";

    try {
        const storedTheme = localStorage.getItem("shark6-theme");

        if (storedTheme === "light" || storedTheme === "dark") {
            savedTheme = storedTheme;
        }
    } catch (error) {
        console.warn("Theme preference storage unavailable.");
    }

    applyTheme(savedTheme);

    themeToggle.addEventListener("click", () => {

        const newTheme = document.body.classList.contains("light-theme")
            ? "dark"
            : "light";

        applyTheme(newTheme);

        try {
            localStorage.setItem("shark6-theme", newTheme);
        } catch (error) {
            console.warn("Unable to save theme preference.");
        }
    });


    // =====================================



    console.log("BYD SHARK 6 Digital Showroom initialized.");
});


// =====================================
// 7. FLOATING DOCK ACTIVE SECTION
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    const dockItems = document.querySelectorAll(".dock-item");

    const sectionMap = [
        { id: "home", href: "#home" },
        { id: "colours", href: "#colours" },
        { id: "technology", href: "#technology" }
    ];

    function setActiveDock(href) {
        dockItems.forEach(item => {
            const isActive = item.getAttribute("href") === href;

            item.classList.toggle("active", isActive);
            item.setAttribute("aria-current", isActive ? "page" : "false");
        });
    }

    dockItems.forEach(item => {
        item.addEventListener("click", () => {
            setActiveDock(item.getAttribute("href"));
        });
    });

    let ticking = false;

    function updateDockOnScroll() {
        if (ticking) return;

        ticking = true;

        requestAnimationFrame(() => {

            let currentSection = "#home";
            const activationPoint = window.innerHeight * 0.38;

            sectionMap.forEach(section => {
                const element = document.getElementById(section.id);

                if (!element) return;

                const position = element.getBoundingClientRect();

                if (
                    position.top <= activationPoint &&
                    position.bottom > activationPoint
                ) {
                    currentSection = section.href;
                }
            });

            setActiveDock(currentSection);
            ticking = false;
        });
    }

    window.addEventListener("scroll", updateDockOnScroll, {
        passive: true
    });

    window.addEventListener("resize", updateDockOnScroll);

    setTimeout(updateDockOnScroll, 1000);
});



// ==========================================
// SHARK 6 — INTERACTIVE GLASS FEATURE CARDS
// ==========================================

(() => {
    const cardContent = {
    "feature-card": [
        `DRIVER COCKPIT & DISPLAYS

15.6-inch intelligent rotating touchscreen (Premium).
10.25-inch digital instrument cluster.
Windshield head-up display.
Wireless Apple CarPlay and Android Auto connectivity.

A technology-focused cockpit designed to keep important driving information and entertainment within reach.`,

        `COMFORT & CABIN

Five-seat double-cab configuration.
Synthetic leather-style seat upholstery.
8-way power-adjustable driver's seat.
Automatic dual-zone climate control.
Heated and ventilated front seats.
12-speaker Dynaudio sound system.

The Premium cabin combines everyday comfort with useful technology for longer journeys.`,

        `CONNECTED CONVENIENCE

50W wireless phone charging.
USB-C and USB-A connections at the front and rear.
Bluetooth phone connectivity and audio streaming.
Voice assistant.
Wireless Apple CarPlay and wired or wireless Android Auto.

Features and compatibility may vary by device.`
    ],

    "adventure-card": [
        `DMO SUPER HYBRID OFF-ROAD SYSTEM

Dedicated DMO plug-in hybrid architecture.
All-wheel drive (AWD).
Mud, Sand and Snow terrain modes.
230 mm unladen ground clearance.
700 mm maximum wading depth.

Designed to combine electric drive technology with off-road capability. Always assess water depth and terrain before entering.`,

        `DIMENSIONS & PRACTICALITY

Length: 5,457 mm.
Width: 1,971 mm.
Height: 1,925 mm.
Wheelbase: 2,920 mm.
Five-seat double cab.
Load tray capacity: 1,200 litres.

A substantial double-cab pickup designed for passengers, equipment and everyday utility.`,

        `TOWING & LOAD CAPABILITY

Braked towing capacity: 2,500 kg.
Unbraked towing capacity: 750 kg.
Gross vehicle mass: 3,500 kg.
Kerb weight: 2,710 kg.
Load tray capacity: 1,200 litres.

Always follow the vehicle handbook and applicable towing and loading limits.`,

        `CHASSIS & TERRAIN

Double-wishbone front suspension.
Double-wishbone rear suspension.
Ventilated disc brakes front and rear.
18-inch alloy wheels.
Approach angle: 31 degrees.
Departure angle: 19.3 degrees.
Ramp-over angle: 17 degrees.

Mud, Sand and Snow modes help adapt the vehicle to different driving conditions.`
    ],

    "technology-card": [
        `1.5-LITRE TURBO HYBRID POWERTRAIN

Engine: 1.5-litre turbocharged petrol.
Engine output: 135 kW.
Engine torque: 260 Nm.
Front electric motor: 170 kW / 310 Nm.
Rear electric motor: 150 kW / 340 Nm.

Combined system output: 321 kW.
Combined system torque: 650 Nm.
0–100 km/h: 5.7 seconds.
All-wheel drive.

The petrol engine and electric motors work together as BYD's DMO Super Hybrid system.`,

        `BYD BLADE BATTERY & CHARGING

Battery chemistry: Lithium Iron Phosphate (LFP).
Battery type: BYD Blade Battery.
Battery capacity: 29.58 kWh.
Published pure-electric range: up to 85 km (WLTP).
Published combined range: 670 km (WLTP).
AC charging: up to 7 kW.
DC charging: up to 55 kW.

Battery warranty: 8 years or 200,000 km, subject to BYD warranty terms.

Actual range and charging times depend on driving conditions, temperature, charger and vehicle use.`,

        `SAFETY & DRIVER ASSISTANCE

7 SRS airbags.
Adaptive Cruise Control.
Automatic Emergency Braking.
Lane Departure Warning and Lane Departure Prevention.
Blind Spot Detection.
Front and rear cross-traffic alert.
360-degree camera.
Hill Hold Control.
Hill Descent Control.
Vehicle Dynamic Control.

The South African BYD SHARK 6 is listed with a 5-star ANCAP safety rating. Driver-assistance systems support the driver and do not replace attention or safe driving.`
    ]
};

    function initialiseInteractiveCards() {
        const cardTypes = Object.keys(cardContent);
        let openCard = null;

        cardTypes.forEach(type => {
            const cards = document.querySelectorAll("." + type);

            cards.forEach((card, index) => {
                if (card.dataset.interactiveReady === "true") return;

                const description = cardContent[type][index];
                if (!description) return;

                card.dataset.interactiveReady = "true";

                const exploreButton = document.createElement("button");
                exploreButton.type = "button";
                exploreButton.className = "card-explore";
                exploreButton.textContent = "Explore";
                exploreButton.setAttribute("aria-expanded", "false");

                const details = document.createElement("div");
                details.className = "card-details";
                details.id = "card-details-" + type + "-" + index;
                details.setAttribute("aria-hidden", "true");

                const detailsInner = document.createElement("div");
                detailsInner.className = "card-details-inner";

                const detailsText = document.createElement("p");
                detailsText.textContent = description;

        
        
        

                detailsInner.append(detailsText);
                details.appendChild(detailsInner);

                exploreButton.setAttribute("aria-controls", details.id);

                exploreButton.addEventListener("click", () => {
                    if (openCard && openCard !== card) {
                        closeCard(openCard);
                    }

                    const isOpening = !card.classList.contains("is-expanded");

                    if (isOpening) {
                        card.classList.add("is-expanded");
                        exploreButton.textContent = "Close details";
                        exploreButton.setAttribute("aria-expanded", "true");
                        details.setAttribute("aria-hidden", "false");
                        openCard = card;
                    } else {
                        closeCard(card);
                    }
                });

                function closeCard(target) {
                    target.classList.remove("is-expanded");

                    const button = target.querySelector(".card-explore");
                    const panel = target.querySelector(".card-details");

                    if (button) {
                        button.textContent = "Explore";
                        button.setAttribute("aria-expanded", "false");
                    }

                    if (panel) {
                        panel.setAttribute("aria-hidden", "true");
                    }

                    if (openCard === target) {
                        openCard = null;
                    }
                }

                card.append(exploreButton, details);
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialiseInteractiveCards);
    } else {
        initialiseInteractiveCards();
    }
})();






