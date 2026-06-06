
        document.addEventListener('DOMContentLoaded', function() {
            // Init AOS
            AOS.init({ duration: 800, once: true, offset: 50 });

            // Sticky Header
            const header = document.getElementById('header');
            const topHeader = document.getElementById('top-header');
            const mainNav = document.getElementById('navigation');
            if (header) {
                const headerOffset = header.offsetTop;
                window.addEventListener('scroll', () => {
                    if (window.scrollY > headerOffset + 50) {
                        header.classList.add('sticky-glass');
                        if(mainNav) mainNav.style.display = 'none'; // Optional: simplify nav on scroll
                    } else {
                        header.classList.remove('sticky-glass');
                        if(mainNav && window.innerWidth >= 768) mainNav.style.display = 'block';
                    }
                });
            }

            // Web3Forms AJAX Override
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                const isWeb3 = form.querySelector('input[name="access_key"]');
                if (isWeb3) {
                    // Remove standard redirect to stop page reload
                    const redirectInput = form.querySelector('input[name="redirect"]');
                    if(redirectInput) redirectInput.remove();

                    form.addEventListener('submit', async function(e) {
                        e.preventDefault();
                        const btn = form.querySelector('button[type="submit"]');
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
                        btn.disabled = true;

                        const formData = new FormData(form);
                        try {
                            const response = await fetch('https://api.web3forms.com/submit', {
                                method: 'POST',
                                body: formData
                            });
                            const data = await response.json();
                            if (data.success) {
                                Swal.fire({
                                    icon: 'success',
                                    title: 'تم بنجاح!',
                                    text: 'تم استلام طلبك وسنتواصل معك قريباً.',
                                    confirmButtonColor: '#C5A059',
                                    confirmButtonText: 'حسناً'
                                });
                                form.reset();
                            } else {
                                throw new Error('فشل الإرسال');
                            }
                        } catch (error) {
                            Swal.fire({
                                icon: 'error',
                                title: 'عذراً!',
                                text: 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.',
                                confirmButtonColor: '#103C2B',
                                confirmButtonText: 'حسناً'
                            });
                        } finally {
                            btn.innerHTML = originalText;
                            btn.disabled = false;
                        }
                    });
                }
            });
        });

        // Hide preloader on load
        window.addEventListener('load', function() {
            const preloader = document.getElementById('kael-preloader');
            if (preloader) {
                preloader.style.opacity = '0';
                setTimeout(() => preloader.style.display = 'none', 500);
            }
        });
    