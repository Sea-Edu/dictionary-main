document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const fontSelect = document.getElementById("font-select");
  const searchButton = document.getElementById("search-button");
  const searchInput = document.getElementById("search-input");
  const definitionContainer = document.getElementById("definition");
  const inputTheme = document.getElementById("theme-input")

  const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

  // Create loader element
  const loader = document.createElement("div");
  loader.id = "loader";
  loader.className = "loader";
  loader.textContent = "Loading...";
  loader.style.display = "none"; // Initially hide the loader
  definitionContainer.appendChild(loader); // Append the loader to the definition container

  // Load saved settings from localStorage
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    inputTheme.checked = true;
  }
  const savedFont = localStorage.getItem("fontFamily");
  if (savedFont) {
    document.body.style.fontFamily = savedFont;
    fontSelect.value = savedFont;
  }


  // Toggle theme
  themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark") ? "dark" : "light"
    );
  });

  // Change font family
  fontSelect.addEventListener("change", (event) => {
    document.body.style.fontFamily = event.target.value;
    localStorage.setItem("fontFamily", event.target.value);
  });

  // Save search input value
  searchInput.addEventListener("input", (event) => {
    localStorage.setItem("searchInput", event.target.value);
  });

  // Search for word definition when search button is clicked
  searchButton.addEventListener("click", () => {
    handleSearch();
  });

  // Search for word definition when "Enter" key is pressed
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  });

  const handleSearch = () => {
    const word = searchInput.value.trim();
    if (word) {
      fetchDefinition(word);
    }
    if (searchInput.value !== "") {
      searchInput.style.border = "";
    } else {
      searchInput.style.border = "1px solid red";
    }
  };

  // Fetch word definition from API
  const fetchDefinition = async (word) => {
    try {
      showLoader(); // Show loader before making API call
      const response = await fetch(`${API_URL}${word}`);
      if (!response.ok) {
        throw new Error("Word not found");
      }
      const data = await response.json();
      displayDefinition(data);
    } catch (error) {
      definitionContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`;
    } finally {
      hideLoader(); // Hide loader after API call completes
    }
  };

  // Display word definition
  const displayDefinition = (data) => {
    const wordData = data[0];
    const { word, phonetics, meanings } = wordData;
    const phoneticText = phonetics.length ? phonetics[0].text : "";
    const audioSrc =
      phonetics.length && phonetics[0].audio ? phonetics[0].audio : null;
    const definitions = meanings
      .map((meaning) => {
        const definitionsList = meaning.definitions
          .map((def) => `<li class="mb-2">${def.definition}</li>`)
          .join("");
        return `
                <h3 class="mt-4 text-lg font-semibold">${meaning.partOfSpeech}</h3>
                <ul class="list-disc list-inside">${definitionsList}</ul>
            `;
      })
      .join("");

    definitionContainer.innerHTML = `
    <div class="flex justify-between align-center">
        <div class="sections">
            <h2 class="text-5xl mb-4">${word}</h2>
            <p>${phoneticText}</p>
        </div>
        <div class="play-container">
          <i id="play-audio" class="fa-solid fa-play play-audio"></i>
          <audio id="audio" class="ml-2">
           <source src="${audioSrc}" type="audio/mp3">
         </audio>
         </div>
        
      </div>
        ${definitions}`;

    // Add event listener to play audio
    const playAudioButton = document.getElementById("play-audio");
    const audioElement = document.getElementById("audio");
    if (playAudioButton && audioElement) {
      playAudioButton.addEventListener("click", () => {
        if (audioElement.paused) {
          audioElement.play();
        } else {
          audioElement.pause();
        }
      });

      audioElement.addEventListener("play", () => {
        playAudioButton.classList.remove("fa-play");
        playAudioButton.classList.add("fa-pause");
      });

      audioElement.addEventListener("pause", () => {
        playAudioButton.classList.remove("fa-pause");
        playAudioButton.classList.add("fa-play");
      });

      audioElement.addEventListener("ended", () => {
        playAudioButton.classList.remove("fa-pause");
        playAudioButton.classList.add("fa-play");
      });
    }
  };

  const showLoader = () => {
    loader.style.display = "block";
  };

  const hideLoader = () => {
    loader.style.display = "none";
  };
});
