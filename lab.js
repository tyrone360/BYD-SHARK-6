document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);

    // Shared theme preference with the main showroom
    const themeToggle = $("themeToggle");

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
            console.warn("Could not save theme preference.");
        }
    });

    // Vehicle state
    let vehicleOn = false;
    let vehicleLocked = true;
    let speed = 0;

    const powerButton = $("powerButton");
    const powerButtonText = $("powerButtonText");
    const vehicleStatus = $("vehicleStatus");
    const powerReadout = $("powerReadout");
    const gearReadout = $("gearReadout");
    const speedReadout = $("speedReadout");
    const driveSpeed = $("driveSpeed");
    const driveMessage = $("driveMessage");
    const speedBar = $("speedBar");
    // SIMULATED HYBRID ENERGY AND TRIP TRACKING
    let fuelRemaining = 468;
    let batteryRemaining = 86;
    let tripDistance = 0;
    let driveSimulationTimer = null;

    function updateEnergyDashboard() {
        const fuelPercent = Math.max(0, Math.min(100, fuelRemaining / 6));
        const batteryPercent = Math.max(0, Math.min(100, batteryRemaining));

        $("fuelGaugeFill").style.width = `${fuelPercent}%`;
        $("fuelPercent").textContent = `${Math.round(fuelPercent)}%`;
        $("fuelRange").textContent = Math.round(fuelRemaining);

        $("batteryGaugeFill").style.width = `${batteryPercent}%`;
        $("batteryPercent").textContent = `${Math.round(batteryPercent)}%`;
        $("electricRange").textContent = Math.round(batteryRemaining);

        $("combinedRange").textContent = Math.round(fuelRemaining + batteryRemaining);
        $("tripDistance").textContent = tripDistance.toFixed(1);
    }

    function syncDriveSimulation() {
        if (speed > 0 && !driveSimulationTimer) {
            driveSimulationTimer = window.setInterval(() => {
                if (!vehicleOn || speed <= 0) return;

                const distanceStep = speed / 120;
                tripDistance += distanceStep;

                batteryRemaining = Math.max(0, batteryRemaining - distanceStep * 0.65);
                fuelRemaining = Math.max(0, fuelRemaining - distanceStep * 0.35);

                updateEnergyDashboard();

                if (fuelRemaining <= 0 && batteryRemaining <= 0) {
                    speed = 0;
                    updateSpeed();
                    driveMessage.textContent = "Simulated energy depleted. Journey stopped.";
                }
            }, 1000);
        }

        if (speed === 0 && driveSimulationTimer) {
            window.clearInterval(driveSimulationTimer);
            driveSimulationTimer = null;
        }
    }


    function updateSpeed() {
        speedReadout.textContent = speed;
        driveSpeed.textContent = speed;
        speedBar.style.width = `${(speed / 120) * 100}%`;
        syncDriveSimulation();

        if (speed === 0) {
            driveMessage.textContent = "Vehicle is stationary";
        } else if (speed < 40) {
            driveMessage.textContent = "Moving at a low simulated speed";
        } else if (speed < 80) {
            driveMessage.textContent = "Simulated cruising speed";
        } else {
            driveMessage.textContent = "High simulated speed";
        }
    }

    function stopVehicle() {
        speed = 0;
        updateSpeed();
    }

    let vehicleStarting = false;

    powerButton.addEventListener("click", () => {
        if (vehicleStarting) return;

        if (!vehicleOn) {
            vehicleStarting = true;
            powerButton.disabled = true;
            powerButton.classList.add("is-processing");
            powerButtonText.textContent = "INITIALISING...";
            vehicleStatus.textContent = "SYSTEMS CHECK";
            powerReadout.textContent = "STARTING";
            driveMessage.textContent = "Initialising vehicle systems...";
            gearReadout.textContent = "P";

            window.setTimeout(() => {
                vehicleOn = true;
                vehicleLocked = false;
                vehicleStarting = false;

                powerButton.disabled = false;
                powerButton.classList.remove("is-processing");
                powerButtonText.textContent = "STOP VEHICLE";

                vehicleStatus.textContent = "VEHICLE RUNNING";
                vehicleStatus.classList.add("is-on");
                powerReadout.textContent = "ON";
                gearReadout.textContent = "P";

                $("lockIcon").textContent = "▣";
                $("lockButtonText").textContent = "LOCK VEHICLE";

                driveMessage.textContent = "Vehicle systems ready. Drive simulation enabled.";
            }, 3000);

        } else {
            vehicleOn = false;
            stopVehicle();

            powerButtonText.textContent = "START VEHICLE";
            vehicleStatus.textContent = "POWER OFF";
            vehicleStatus.classList.remove("is-on");
            powerReadout.textContent = "OFF";
            gearReadout.textContent = "P";

            turnOffSignals();
        }
    });
    $("lockButton").addEventListener("click", () => {
        vehicleLocked = !vehicleLocked;

        $("lockIcon").textContent = vehicleLocked ? "▣" : "□";
        $("lockButtonText").textContent = vehicleLocked
            ? "UNLOCK VEHICLE"
            : "LOCK VEHICLE";
    });

    // Cabin comfort controls
    function setupToggle(buttonId, statusId, onText, offText) {
        const button = $(buttonId);
        const status = $(statusId);

        button.addEventListener("click", () => {
            const isOn = button.getAttribute("aria-pressed") !== "true";
            button.setAttribute("aria-pressed", String(isOn));
            status.textContent = isOn ? onText : offText;
        });
    }

    setupToggle("climateToggle", "climateStatus", "Climate is on", "System is off");
    setupToggle("seatToggle", "seatStatus", "Heating active", "Heating inactive");
    setupToggle("sunroofToggle", "sunroofStatus", "Open", "Closed");

    let temperature = 22;

    function updateTemperature() {
        $("temperatureValue").textContent = temperature;
    }

    $("tempDown").addEventListener("click", () => {
        temperature = Math.max(16, temperature - 1);
        updateTemperature();
    });

    $("tempUp").addEventListener("click", () => {
        temperature = Math.min(30, temperature + 1);
        updateTemperature();
    });

    // Indicators and hazard lights
    let activeSignal = "none";
    let signalTimer = null;

    function turnOffSignals() {
        activeSignal = "none";

        ["leftSignal", "rightSignal", "hazardSignal"].forEach(id => {
            $(id).setAttribute("aria-pressed", "false");
        });

        $("leftLamp").classList.remove("active");
        $("rightLamp").classList.remove("active");
        $("signalStatus").textContent = "ALL SIGNALS OFF";

        if (signalTimer) {
            clearInterval(signalTimer);
            signalTimer = null;
        }
    }

    function showSignalState() {
        const showLeft = activeSignal === "left" || activeSignal === "hazard";
        const showRight = activeSignal === "right" || activeSignal === "hazard";

        $("leftLamp").classList.toggle("active", showLeft);
        $("rightLamp").classList.toggle("active", showRight);
    }

    function activateSignal(signal) {
        if (activeSignal === signal) {
            turnOffSignals();
            return;
        }

        turnOffSignals();
        activeSignal = signal;

        const buttonId = signal === "left"
            ? "leftSignal"
            : signal === "right"
                ? "rightSignal"
                : "hazardSignal";

        $(buttonId).setAttribute("aria-pressed", "true");

        $("signalStatus").textContent = signal === "hazard"
            ? "HAZARD LIGHTS ACTIVE"
            : signal.toUpperCase() + " INDICATOR ACTIVE";

        showSignalState();

        signalTimer = setInterval(() => {
            $("leftLamp").classList.toggle("active", !$("leftLamp").classList.contains("active") && (activeSignal === "left" || activeSignal === "hazard"));
            $("rightLamp").classList.toggle("active", !$("rightLamp").classList.contains("active") && (activeSignal === "right" || activeSignal === "hazard"));
        }, 500);
    }

    $("leftSignal").addEventListener("click", () => activateSignal("left"));
    $("rightSignal").addEventListener("click", () => activateSignal("right"));
    $("hazardSignal").addEventListener("click", () => activateSignal("hazard"));

    // Simulated acceleration and braking
    $("accelerateButton").addEventListener("click", () => {
        if (!vehicleOn) {
            driveMessage.textContent = "Start the vehicle first";
            return;
        }

        if (vehicleLocked) {
            driveMessage.textContent = "Unlock the vehicle first";
            return;
        }

        speed = Math.min(120, speed + 10);
        gearReadout.textContent = "D";
        updateSpeed();
    });

    $("brakeButton").addEventListener("click", () => {
        speed = Math.max(0, speed - 15);
        if (speed === 0) {
            gearReadout.textContent = "P";
        }
        updateSpeed();
    });

    // Virtual parking scan
    let parkingRunning = false;
    let parkingTimer = null;

    $("parkingButton").addEventListener("click", () => {
        const visual = document.querySelector(".parking-visual");
        const button = $("parkingButton");

        if (parkingRunning) {
            clearTimeout(parkingTimer);
            parkingRunning = false;
            visual.classList.remove("scanning");
            button.innerHTML = "<span>⌖</span> START PARKING ASSIST";
            $("parkingStatus").textContent = "Virtual scan stopped.";
            $("parkingDistance").textContent = "SCAN STOPPED";
            return;
        }

        parkingRunning = true;
        visual.classList.add("scanning");
        button.innerHTML = "<span>×</span> STOP SCAN";
        $("parkingStatus").textContent = "Scanning the virtual surroundings...";
        $("parkingDistance").textContent = "SCANNING...";

        parkingTimer = setTimeout(() => {
            parkingRunning = false;
            visual.classList.remove("scanning");
            button.innerHTML = "<span>⌖</span> SCAN AGAIN";
            $("parkingStatus").textContent = "Virtual scan complete. No real obstacles were detected.";
            $("parkingDistance").textContent = "DEMO SCAN COMPLETE";
        }, 3000);
    });

    updateEnergyDashboard();
    updateSpeed();
    updateTemperature();
});

// =========================================
// SHARK 6 COLOUR SELECTION + SWIPE CONTROL
// =========================================
document.addEventListener("DOMContentLoaded", () => {
    const vehicleImage = document.getElementById("vehicleImage");
    const vehicleVisual = document.getElementById("vehicleVisual");
    const colourOptions = document.querySelectorAll("[data-vehicle-colour]");

    if (!vehicleImage || !vehicleVisual || !colourOptions.length) return;

    const vehicleColours = [
        { name: "black", src: "_Assets/Colours/black-side.webp" },
        { name: "grey", src: "_Assets/Colours/gray-side-.webp" },
        { name: "green", src: "_Assets/Colours/shark-green.webp" },
        { name: "white", src: "_Assets/Colours/white-side-.webp" }
    ];

    let selectedColour = 2;

    function selectVehicleColour(index) {
        selectedColour = (index + vehicleColours.length) % vehicleColours.length;

        const selected = vehicleColours[selectedColour];

        vehicleImage.style.opacity = "0";
        vehicleImage.style.transform = "scale(.97)";

        window.setTimeout(() => {
            vehicleImage.src = selected.src;
            vehicleImage.alt = `BYD SHARK 6 in ${selected.name}`;
            vehicleImage.style.opacity = "1";
            vehicleImage.style.transform = "scale(1)";
        }, 180);

        colourOptions.forEach((button, buttonIndex) => {
            const active = button.dataset.vehicleColour === selected.name;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });
    }

    colourOptions.forEach((button) => {
        button.addEventListener("click", () => {
            const index = vehicleColours.findIndex(
                colour => colour.name === button.dataset.vehicleColour
            );

            if (index !== -1) selectVehicleColour(index);
        });
    });

    let touchStartX = 0;
    let touchStartY = 0;

    vehicleVisual.addEventListener("pointerdown", (event) => {
        touchStartX = event.clientX;
        touchStartY = event.clientY;
    });

    vehicleVisual.addEventListener("pointerup", (event) => {
        const differenceX = event.clientX - touchStartX;
        const differenceY = event.clientY - touchStartY;

        if (Math.abs(differenceX) < 45 ||
            Math.abs(differenceX) < Math.abs(differenceY)) return;

        selectVehicleColour(
            selectedColour + (differenceX < 0 ? 1 : -1)
        );
    });

    vehicleVisual.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") {
            selectVehicleColour(selectedColour + 1);
        } else if (event.key === "ArrowLeft") {
            selectVehicleColour(selectedColour - 1);
        }
    });

    vehicleVisual.setAttribute("tabindex", "0");
    vehicleVisual.setAttribute("aria-label", "Swipe or use arrow keys to change vehicle colour");

    selectVehicleColour(selectedColour);
});




// =========================================
// SHARK 6 AMBIENT LED COLOUR CONTROLLER
// =========================================
document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("ambientColourSlider");
    const preview = document.getElementById("ambientPreview");
    const colourName = document.getElementById("ambientColourName");
    const colourValue = document.getElementById("ambientColourValue");

    if (!slider || !preview || !colourName || !colourValue) return;

    function getColourName(hue) {
        if (hue < 20 || hue >= 345) return "Red";
        if (hue < 45) return "Warm Gold";
        if (hue < 65) return "Yellow";
        if (hue < 145) return "Green";
        if (hue < 190) return "Turquoise";
        if (hue < 250) return "Blue";
        if (hue < 285) return "Violet";
        if (hue < 345) return "Pink";
        return "Custom";
    }

    function updateAmbientLighting() {
        const hue = Number(slider.value);

        preview.style.setProperty("--ambient-hue", hue);
        colourName.textContent = getColourName(hue);
        colourValue.textContent = `${hue}°`;
        slider.setAttribute("aria-valuetext", `${getColourName(hue)} (${hue} degrees)`);
    }

    slider.addEventListener("input", updateAmbientLighting);
    slider.addEventListener("change", updateAmbientLighting);

    updateAmbientLighting();
});

