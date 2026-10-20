/*==================================================
            TESTE DE SINCRONIZAÇÃO V2
==================================================*/

const videoGrid = document.getElementById("videoGrid");

const globalSlider = document.getElementById("globalSlider");

const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");

const gridButton = document.getElementById("gridButton");
const gridMenu = document.getElementById("gridMenu");
const tempoButton = document.getElementById("tempoButton");

const loadVideosBtn = document.getElementById("loadVideosBtn");
const clearVideosBtn = document.getElementById("clearVideosBtn");

const multiVideoInput = document.getElementById("multiVideoInput");

const settingsButton = document.getElementById("settingsButton");
const settingsMenu = document.getElementById("settingsMenu");

const autoRestartVideos =
    document.getElementById("autoRestartVideos");

const noVerticalCoverCheckbox =
    document.getElementById("noVerticalCover");

const gridScaleSlider =
    document.getElementById("gridScaleSlider");


let players = [];

let quantidadeAtual = 2;

let arrastandoSliderGlobal = false;

let arquivosSelecionados = [];


autoRestartVideos.checked = true;


function aplicarTamanhoGrid(valor) {

    const valorFinal =
        Number(valor) || 1;

    videoGrid.style.setProperty(
        "--grid-scale",
        String(valorFinal)
    );

    videoGrid.style.zoom =
        String(valorFinal);

}


/*==================================================
                FORMATAR TEMPO
==================================================*/

function formatarTempo(segundos) {

    if (isNaN(segundos)) {

        return "00:00";

    }

    const m = Math.floor(segundos / 60);

    const s = Math.floor(segundos % 60);

    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

}


/*==================================================
                CLASSE PLAYER
==================================================*/

class VideoPlayer {

    constructor(numero) {

        this.numero = numero;

        this.criarHTML();

        this.registrarEventos();

    }


    criarHTML() {

        this.card = document.createElement("div");

        this.card.className = "video-card";


        this.card.innerHTML = `

            <input
                type="file"
                accept="video/*"
                hidden>


            <div class="video-wrapper">

                <video preload="metadata"></video>


                <div class="video-crop-control">

                    <input
                        class="video-crop-slider"
                        type="range"
                        min="0"
                        max="100"
                        value="50"
                        step="1"
                        aria-label="Mover área visível do vídeo">

                </div>


                <div class="video-volume-control">

                    <button
                        class="video-volume-toggle"
                        type="button"
                        title="Volume"
                        aria-label="Volume do vídeo">

                        🔊

                    </button>

                    <input
                        class="video-volume-slider"
                        type="range"
                        min="0"
                        max="1"
                        value="0.8"
                        step="0.01"
                        aria-label="Ajustar volume">

                </div>


                <div class="local-slider">

                    <input
                        type="range"
                        min="0"
                        max="100"
                        value="0"
                        step="0.01">

                </div>

            </div>


            <div class="video-bottom">

                <button class="change-video">
                    📂
                </button>

                <span class="file-name">
                    Nenhum arquivo selecionado
                </span>

            </div>


            <div class="video-info">

                <span class="tempo">
                    00:00 / 00:00
                </span>

                <span class="porcentagem">
                    0%
                </span>

            </div>

        `;


        this.video =
            this.card.querySelector("video");

        this.input =
            this.card.querySelector(
                "input[type=file]"
            );

        this.botao =
            this.card.querySelector(
                ".change-video"
            );

        this.nome =
            this.card.querySelector(
                ".file-name"
            );

        this.slider =
            this.card.querySelector(
                ".local-slider input"
            );

        this.tempo =
            this.card.querySelector(
                ".tempo"
            );

        this.porcentagem =
            this.card.querySelector(
                ".porcentagem"
            );

        this.volumeButton =
            this.card.querySelector(
                ".video-volume-toggle"
            );

        this.volumeSlider =
            this.card.querySelector(
                ".video-volume-slider"
            );

        this.cropControl =
            this.card.querySelector(
                ".video-crop-control"
            );

        this.cropSlider =
            this.card.querySelector(
                ".video-crop-slider"
            );

        this.video.volume = 0.8;
        this.video.style.objectPosition = "center 50%";
        this.cropSlider.value = 50;
        this.card.classList.remove("vertical-video");
        this.cropControl.classList.remove("is-visible");

        videoGrid.appendChild(this.card);

    }


    registrarEventos() {


        /*==================================================
                    TROCAR VÍDEO
        ==================================================*/

        this.botao.addEventListener("click", () => {

            this.input.click();

        });


        this.input.addEventListener("change", () => {

            const arquivo =
                this.input.files[0];

            if (!arquivo) {

                return;

            }


            this.video.pause();

            this.video.src =
                URL.createObjectURL(arquivo);

            this.video.load();

            this.nome.textContent =
                arquivo.name;

            this.slider.value = 0;

            this.atualizarInformacoes();

        });


        /*==================================================
                    SLIDER INDIVIDUAL
        ==================================================*/

        this.slider.addEventListener("input", () => {

            if (!this.video.duration) {

                return;

            }


            this.video.pause();


            const porcentagem =
                this.slider.value / 100;


            this.video.currentTime =
                this.video.duration * porcentagem;


            this.atualizarInformacoes();

        });


        /*==================================================
                    FOCO / PAUSA
        ==================================================*/

        this.video.addEventListener("click", () => {

            if (this.video.paused) {

                this.video.play().catch(() => { });

                return;

            }

            this.video.pause();

        });


        this.video.addEventListener("loadedmetadata", () => {

            this.aplicarLayoutDoVideo();
            this.atualizarPosicaoCrop();

        });

        this.video.addEventListener("mouseenter", () => {

            const eVertical =
                this.video.videoHeight > this.video.videoWidth;

            const deveMostrar =
                eVertical &&
                !noVerticalCoverCheckbox.checked;

            if (deveMostrar) {

                this.cropControl.classList.add("is-visible");

            }

        });

        this.video.addEventListener("mouseleave", () => {

            this.cropControl.classList.remove("is-visible");

        });


        this.cropSlider.addEventListener("input", (e) => {

            e.stopPropagation();

            const valor = Number(e.target.value);
            const posicaoInvertida = 100 - valor;

            this.video.style.objectPosition = `center ${posicaoInvertida}%`;

        });


        /*==================================================
                    VOLUME
        ==================================================*/

        this.volumeButton.addEventListener(
            "click",
            (e) => {

                e.stopPropagation();

                this.volumeSlider.hidden =
                    !this.volumeSlider.hidden;

            }
        );


        this.volumeSlider.addEventListener(
            "input",
            (e) => {

                e.stopPropagation();

                this.video.volume =
                    Number(this.volumeSlider.value);

            }
        );

    }


    aplicarLayoutDoVideo() {

        if (!this.video.videoWidth || !this.video.videoHeight) {

            return;

        }

        const eVertical =
            this.video.videoHeight > this.video.videoWidth;

        const deveManterAspecto =
            eVertical && noVerticalCoverCheckbox.checked;

        this.card.classList.toggle("natural-ratio", eVertical);
        this.card.classList.toggle("vertical-video", eVertical);
        this.card.classList.toggle("no-vertical-cover", deveManterAspecto);

        if (deveManterAspecto) {

            this.video.style.objectFit = "contain";
            this.video.style.objectPosition = "center";
            this.cropControl.classList.remove("is-visible");
            return;

        }

        if (eVertical) {

            this.video.style.objectFit = "cover";
            this.video.style.objectPosition = `center ${100 - Number(this.cropSlider.value)}%`;
            this.cropControl.classList.remove("is-visible");

        } else {

            this.video.style.objectFit = "cover";
            this.video.style.objectPosition = "center";
            this.cropControl.classList.remove("is-visible");

        }

        if (this.card.classList.contains("focused")) {

            const emFullscreen =
                document.fullscreenElement === videoGrid;

            if (emFullscreen && !eVertical) {

                videoGrid.classList.add("horizontal-focus-layout");

            } else {

                videoGrid.classList.remove("horizontal-focus-layout");

            }

        }

    }


    atualizarPosicaoCrop() {

        if (!this.video.videoWidth || !this.video.videoHeight) {

            return;

        }

        const eVertical =
            this.video.videoHeight > this.video.videoWidth;

        this.card.classList.toggle("vertical-video", eVertical);
        this.card.classList.toggle("no-vertical-cover", eVertical && noVerticalCoverCheckbox.checked);

        if (!eVertical || noVerticalCoverCheckbox.checked) {

            this.cropSlider.value = 50;
            this.video.style.objectFit = noVerticalCoverCheckbox.checked ? "contain" : "cover";
            this.video.style.objectPosition = "center";
            this.cropControl.classList.remove("is-visible");
            return;

        }

        this.video.style.objectFit = "cover";
        this.video.style.objectPosition = `center ${100 - Number(this.cropSlider.value)}%`;
        this.cropControl.classList.remove("is-visible");

    }




    atualizarInformacoes() {

        if (!this.video.duration) {

            this.tempo.textContent =
                "00:00 / 00:00";

            this.porcentagem.textContent =
                "0%";

            return;

        }


        this.tempo.textContent =
            `${formatarTempo(this.video.currentTime)} / ${formatarTempo(this.video.duration)}`;


        const p =
            (this.video.currentTime /
                this.video.duration) * 100;


        this.slider.value = p;

        this.porcentagem.textContent =
            `${p.toFixed(2)}%`;

    }


    play() {

        if (!this.video.src) {

            return;

        }


        this.video.play().catch(() => { });

    }


    pause() {

        this.video.pause();

    }


    restart() {

        if (!this.video.src) {

            return;

        }


        this.video.pause();

        this.video.currentTime = 0;

        this.slider.value = 0;

        this.atualizarInformacoes();

    }


    irParaPorcentagem(p) {

        if (!this.video.duration) {

            return;

        }


        this.video.currentTime =
            this.video.duration * p;

        this.atualizarInformacoes();

    }

}


/*==================================================
                GRID
==================================================*/

function limparGrid() {

    players = [];

    videoGrid.innerHTML = "";

}


function aplicarArquivosSelecionados() {

    if (!arquivosSelecionados.length) {

        return;

    }

    arquivosSelecionados.forEach(
        (arquivo, index) => {

            if (index >= players.length) {

                return;

            }

            const player =
                players[index];

            player.video.src =
                URL.createObjectURL(arquivo);

            player.video.load();

            player.nome.textContent =
                arquivo.name;

            player.slider.value = 0;

            player.input.value = "";

        }
    );

}


function criarGrid(quantidade) {

    const isUnlimited =
        quantidade === "unlimited";

    const quantidadeFinal =
        isUnlimited
            ? (
                arquivosSelecionados.length > 0
                    ? arquivosSelecionados.length
                    : Math.max(
                        1,
                        Number(
                            document.getElementById("unlimitedQuantity")?.value || 8
                        )
                    )
            )
            : quantidade;

    quantidadeAtual = quantidadeFinal;

    limparGrid();


    videoGrid.classList.remove(
        "grid-2",
        "grid-4",
        "grid-6",
        "grid-unlimited"
    );


    if (isUnlimited) {

        videoGrid.classList.add("grid-unlimited");

    } else {

        videoGrid.classList.add(
            `grid-${quantidade}`
        );

    }


    for (
        let i = 1;
        i <= quantidadeFinal;
        i++
    ) {

        const player =
            new VideoPlayer(i);

        players.push(player);

    }


    if (arquivosSelecionados.length) {

        aplicarArquivosSelecionados();

    }

}


/*==================================================
            MENU CONFIGURAÇÕES
==================================================*/

settingsButton.addEventListener(
    "click",
    (e) => {

        e.stopPropagation();

        settingsMenu.classList.toggle("open");

    }
);


tempoButton.addEventListener(
    "click",
    () => {

        players.forEach(
            player => {

                if (!player.video.src || !player.video.duration) {

                    return;

                }

                player.pause();

                const porcentagemAleatoria =
                    Math.random();

                player.irParaPorcentagem(
                    porcentagemAleatoria
                );

            }
        );

    }
);


noVerticalCoverCheckbox.addEventListener(
    "change",
    () => {

        players.forEach(
            player => {

                player.aplicarLayoutDoVideo();
                player.atualizarPosicaoCrop();

            }
        );

    }
);


gridScaleSlider.addEventListener(
    "input",
    (e) => {

        e.stopPropagation();

        aplicarTamanhoGrid(e.target.value);

    }
);


document.addEventListener(
    "click",
    () => {

        settingsMenu.classList.remove("open");

        gridMenu.classList.remove("open");

    }
);


aplicarTamanhoGrid(gridScaleSlider.value);


/*==================================================
        CARREGAR VÁRIOS VÍDEOS
==================================================*/

loadVideosBtn.addEventListener(
    "click",
    () => {

        multiVideoInput.click();

    }
);


multiVideoInput.addEventListener(
    "change",
    () => {

        arquivosSelecionados =
            [...multiVideoInput.files];


        if (!arquivosSelecionados.length) {

            return;

        }


        criarGrid("unlimited");


        const totalArquivos =
            Math.min(
                arquivosSelecionados.length,
                players.length
            );


        for (
            let i = 0;
            i < totalArquivos;
            i++
        ) {

            const arquivo =
                arquivosSelecionados[i];

            const player =
                players[i];


            player.video.src =
                URL.createObjectURL(arquivo);


            player.video.load();


            player.nome.textContent =
                arquivo.name;


            player.slider.value = 0;


            player.input.value = "";

        }


        multiVideoInput.value = "";

    }
);


/*==================================================
                LIMPAR TODOS
==================================================*/

clearVideosBtn.addEventListener(
    "click",
    () => {

        arquivosSelecionados = [];

        criarGrid(2);

        players.forEach(
            player => {

                player.video.pause();

                player.video.removeAttribute("src");

                player.video.load();


                player.nome.textContent =
                    "Nenhum arquivo selecionado";


                player.slider.value = 0;
                player.cropSlider.value = 50;
                player.cropControl.hidden = true;
                player.video.style.objectPosition = "center 50%";


                player.tempo.textContent =
                    "00:00 / 00:00";


                player.porcentagem.textContent =
                    "0%";


                player.input.value = "";

            }
        );


        globalSlider.value = 0;

    }
);


/*==================================================
            CONTROLES GLOBAIS
==================================================*/

playBtn.addEventListener(
    "click",
    () => {

        players.forEach(
            player => {

                player.play();

            }
        );

    }
);


pauseBtn.addEventListener(
    "click",
    () => {

        players.forEach(
            player => {

                player.pause();

            }
        );

    }
);


restartBtn.addEventListener(
    "click",
    () => {

        globalSlider.value = 0;


        players.forEach(
            player => {

                player.restart();

            }
        );

    }
);


/*==================================================
            SLIDER GLOBAL
==================================================*/

globalSlider.addEventListener(
    "mousedown",
    () => {

        arrastandoSliderGlobal = true;

    }
);


globalSlider.addEventListener(
    "mouseup",
    () => {

        arrastandoSliderGlobal = false;

    }
);


globalSlider.addEventListener(
    "input",
    () => {

        const porcentagem =
            globalSlider.value / 100;


        players.forEach(
            player => {

                if (!player.video.duration) {

                    return;

                }


                player.video.pause();

                player.irParaPorcentagem(
                    porcentagem
                );

                player.atualizarInformacoes();

            }
        );

    }
);


/*==================================================
        ATUALIZAÇÃO DA BARRA GLOBAL
==================================================*/

function atualizarSliderGlobal() {

    if (arrastandoSliderGlobal) {

        return;

    }


    if (players.length === 0) {

        return;

    }


    const mestre = players[0];


    if (!mestre.video.duration) {

        return;

    }


    const porcentagem =
        (
            mestre.video.currentTime /
            mestre.video.duration
        ) * 100;


    globalSlider.value =
        porcentagem;

}


/*==================================================
        ATUALIZAÇÃO DOS PLAYERS
==================================================*/

function atualizarPlayers() {

    players.forEach(
        player => {

            player.atualizarInformacoes();

        }
    );

}


/*==================================================
            LOOP PRINCIPAL
==================================================*/

function atualizar() {

    atualizarSliderGlobal();

    atualizarPlayers();

    requestAnimationFrame(atualizar);

}


/*==================================================
            MENU GRID
==================================================*/

gridButton.addEventListener(
    "click",
    (e) => {

        e.stopPropagation();

        gridMenu.classList.toggle("open");

    }
);


gridMenu.addEventListener(
    "click",
    (e) => {

        e.stopPropagation();

    }
);


gridMenu.addEventListener(
    "mousedown",
    (e) => {

        e.stopPropagation();

    }
);


gridMenu.querySelectorAll("button")
    .forEach(
        botao => {

            botao.addEventListener(
                "click",
                (e) => {

                    e.stopPropagation();

                    const valorGrid =
                        botao.dataset.grid;

                    const quantidade =
                        valorGrid === "unlimited"
                            ? "unlimited"
                            : Number(valorGrid);


                    criarGrid(quantidade);


                    gridMenu.classList.remove(
                        "open"
                    );

                }
            );

        }
    );


/*==================================================
            EVENTOS DOS PLAYERS
==================================================*/

function registrarEventosPlayers() {

    players.forEach(
        player => {

            player.video.addEventListener(
                "loadedmetadata",
                () => {

                    player.atualizarInformacoes();

                }
            );


            player.video.addEventListener(
                "timeupdate",
                () => {

                    player.atualizarInformacoes();

                }
            );


            player.video.addEventListener(
                "ended",
                () => {

                    if (
                        autoRestartVideos.checked
                    ) {

                        player.video.currentTime = 0;

                        player.video.play()
                            .catch(() => { });

                        return;

                    }


                    player.pause();

                }
            );

        }
    );

}


/*==================================================
            RECRIAR GRID
==================================================*/

const criarGridOriginal =
    criarGrid;


criarGrid = function(quantidade) {

    criarGridOriginal(quantidade);

    registrarEventosPlayers();

};


/*==================================================
            ATALHOS DO TECLADO
==================================================*/

document.addEventListener(
    "keydown",
    (e) => {

        if (
            e.target.tagName === "INPUT"
        ) {

            return;

        }


        switch (e.code) {


            case "Space":

                e.preventDefault();


                const existeVideoRodando =
                    players.some(
                        player =>
                            !player.video.paused
                    );


                if (existeVideoRodando) {

                    players.forEach(
                        player =>
                            player.pause()
                    );

                } else {

                    players.forEach(
                        player =>
                            player.play()
                    );

                }


                break;


            case "Home":

                restartBtn.click();

                break;


            case "ArrowRight":

                globalSlider.value =
                    Math.min(
                        100,
                        Number(
                            globalSlider.value
                        ) + 1
                    );


                globalSlider.dispatchEvent(
                    new Event("input")
                );

                break;


            case "ArrowLeft":

                globalSlider.value =
                    Math.max(
                        0,
                        Number(
                            globalSlider.value
                        ) - 1
                    );


                globalSlider.dispatchEvent(
                    new Event("input")
                );

                break;

        }

    }
);


/*==================================================
            INICIALIZAÇÃO
==================================================*/

criarGrid(2);

atualizar();


/*==================================================
                DEBUG
==================================================*/

console.log(
    "%cTeste de Sincronização V2",
    "color:#31d0c6;font-size:18px;font-weight:bold;"
);

console.log(
    "Grid inicial:",
    quantidadeAtual,
    "vídeos"
);