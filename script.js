document.addEventListener('DOMContentLoaded', function() {
    const openingScreen = document.getElementById('opening-screen');
    const galleryScreen = document.getElementById('gallery-screen');
    const messageScreen = document.getElementById('message-screen');
    const startBtn = document.getElementById('start-btn');
    const messageBtn = document.getElementById('message-btn');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    const currentDateElement = document.getElementById('current-date');
    const videoPlayButton = document.querySelector('.video-play-button');
    const video = document.querySelector('video');
    const typingTexts = document.querySelectorAll('.typing-text');
    const messageFooter = document.querySelector('.message-footer');
    
    let musicPlaying = false;
    let autoScrollInterval;
    let typingIndex = 0;

    // Set current date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = new Date().toLocaleDateString('id-ID', options);

    // Fungsi untuk berpindah antar screen
    function showScreen(screenToShow) {
        // Hentikan auto scroll sebelumnya
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
        }
        
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        setTimeout(() => {
            screenToShow.classList.add('active');
            
            // Trigger animations
            if (screenToShow === galleryScreen) {
                animateGallery();
                startAutoScroll(galleryScreen);
            } else if (screenToShow === messageScreen) {
                animateMessage();
                startAutoScroll(messageScreen);
                startTypingEffect();
            }
        }, 100);
    }

    // Animasi untuk galeri
    function animateGallery() {
        const photoCards = document.querySelectorAll('.photo-card');
        photoCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    // Animasi untuk pesan
    function animateMessage() {
        const messageCard = document.querySelector('.message-card');
        messageCard.style.opacity = '1';
        messageCard.style.transform = 'scale(1)';
    }

    // Efek mengetik
    function startTypingEffect() {
        // Reset semua teks
        typingTexts.forEach(text => {
            text.textContent = '';
            text.classList.remove('typing', 'complete');
        });
        
        messageFooter.classList.remove('show');
        typingIndex = 0;
        
        typeNextText();
    }

    function typeNextText() {
        if (typingIndex >= typingTexts.length) {
            // Semua teks selesai, tampilkan footer
            messageFooter.classList.add('show');
            return;
        }
        
        const currentText = typingTexts[typingIndex];
        const textToType = currentText.getAttribute('data-text');
        let charIndex = 0;
        
        currentText.classList.add('typing');
        
        const typingInterval = setInterval(() => {
            if (charIndex < textToType.length) {
                currentText.textContent += textToType.charAt(charIndex);
                charIndex++;
                
                // Auto scroll saat mengetik
                const screen = messageScreen;
                const textBottom = currentText.offsetTop + currentText.offsetHeight;
                const screenBottom = screen.scrollTop + screen.offsetHeight;
                
                if (textBottom > screenBottom - 50) {
                    screen.scrollTo({
                        top: textBottom - screen.offsetHeight + 100,
                        behavior: 'smooth'
                    });
                }
            } else {
                clearInterval(typingInterval);
                currentText.classList.remove('typing');
                currentText.classList.add('complete');
                
                // Tunggu sebentar sebelum teks berikutnya
                setTimeout(() => {
                    typingIndex++;
                    typeNextText();
                }, 500);
            }
        }, 50); // Kecepatan mengetik
    }

    // Auto scroll
    function startAutoScroll(screen) {
        let scrollPosition = 0;
        const scrollSpeed = 0.5; // Kecepatan scroll (pixel per frame)
        
        autoScrollInterval = setInterval(() => {
            if (!screen.classList.contains('active')) {
                clearInterval(autoScrollInterval);
                return;
            }
            
            const maxScroll = screen.scrollHeight - screen.offsetHeight;
            
            if (scrollPosition >= maxScroll) {
                // Reset ke atas setelah mencapai bawah
                scrollPosition = 0;
                screen.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                scrollPosition += scrollSpeed;
                screen.scrollTop = scrollPosition;
            }
        }, 16); // ~60fps
    }

    // Event listener untuk tombol start
    startBtn.addEventListener('click', function() {
        showScreen(galleryScreen);
        // Mulai musik setelah interaksi user
        if (!musicPlaying) {
            bgMusic.play().then(() => {
                musicPlaying = true;
                musicToggle.classList.add('playing');
            }).catch(e => {
                console.log("Autoplay prevented:", e);
            });
        }
    });

    // Event listener untuk tombol pesan
    messageBtn.addEventListener('click', function() {
        showScreen(messageScreen);
    });

    // Kontrol musik
    musicToggle.addEventListener('click', function() {
        if (musicPlaying) {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
        } else {
            bgMusic.play().then(() => {
                musicToggle.classList.add('playing');
            }).catch(e => {
                console.log("Play prevented:", e);
            });
        }
        musicPlaying = !musicPlaying;
    });

    // Video play button
    if (videoPlayButton && video) {
        videoPlayButton.addEventListener('click', function() {
            video.play();
            videoPlayButton.style.display = 'none';
        });

        video.addEventListener('play', function() {
            videoPlayButton.style.display = 'none';
        });

        video.addEventListener('pause', function() {
            videoPlayButton.style.display = 'flex';
        });
    }

    // Parallax effect untuk shapes
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const shapes = document.querySelectorAll('.floating-shape');
        
        shapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.1);
            shape.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
    });

    // Intersection Observer untuk animasi scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.photo-card, .video-section').forEach(el => {
        observer.observe(el);
    });

    // Pause auto scroll saat user interact
    [galleryScreen, messageScreen].forEach(screen => {
        if (screen) {
            screen.addEventListener('mouseenter', () => {
                if (autoScrollInterval) {
                    clearInterval(autoScrollInterval);
                }
            });
            
            screen.addEventListener('touchstart', () => {
                if (autoScrollInterval) {
                    clearInterval(autoScrollInterval);
                }
            });
        }
    });

    // Easter egg: klik 3x pada icon gift
    let clickCount = 0;
    const iconWrapper = document.querySelector('.icon-wrapper');
    if (iconWrapper) {
        iconWrapper.addEventListener('click', function() {
            clickCount++;
            if (clickCount === 3) {
                this.style.animation = 'bounce 1s ease 3';
                setTimeout(() => {
                    this.style.animation = '';
                    clickCount = 0;
                }, 3000);
            }
        });
    }
});