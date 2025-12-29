document.addEventListener("DOMContentLoaded", () => {

    /* ============================= HEADER MATRIZ ============================= */

    const btnAddSector = document.getElementById("btnAddSector");
    const sectorList = document.getElementById("sectorList");

    // CRIAÇÃO DE SETOR
    // Responsável por criar a estrutura DOM de um setor
    // Não adiciona eventos, não controla estado
    function criarSetor(nome = "NOVO SETOR") {
        const li = document.createElement("li");
        li.className = "sector-item";

        const span = document.createElement("span");
        span.className = "name-sector";
        span.textContent = nome;

        const input = document.createElement("input");
        input.type = "text";
        input.className = "edit-input";
        input.style.display = "none"; // começa escondido

        const btnDeleteSector = document.createElement("button");
        btnDeleteSector.className = "delete-sector";
        btnDeleteSector.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

        li.append(span, input, btnDeleteSector);
        return li;
    }

    // Clique no botão "Criar Setor"
    btnAddSector.addEventListener("click", () => {
        const setor = criarSetor();
        sectorList.appendChild(setor);
    });

    // DELETAR SETOR (delegação)
    sectorList.addEventListener("click", (e) => {
        // Verifica se o clique veio de um botão de deletar
        const btnDelete = e.target.closest(".delete-sector");
        if (!btnDelete) return;

        // Sobe no DOM até encontrar o setor correspondente
        const sectorItem = btnDelete.closest(".sector-item");
        if (!sectorItem) return;

        sectorItem.remove();
    });

    // EDIÇÃO DE SETOR — ENTRAR EM MODO EDIÇÃO (dblclick)
    sectorList.addEventListener("dblclick", (e) => {
        // Só entra em edição se o duplo clique for no nome
        const name = e.target.closest(".name-sector");
        if (!name) return;

        const item = name.closest(".sector-item");
        const input = item.querySelector(".edit-input");

        // Sincroniza valor atual
        input.value = name.textContent;

        // Alterna visualmente para modo edição
        name.style.display = "none";
        input.style.display = "block";

        // UX: foco imediato no input
        input.focus();
        input.select();
    });

    // EDIÇÃO DE SETOR — FINALIZAR (Enter / Escape)
    sectorList.addEventListener("keydown", (e) => {
        const input = e.target.closest(".edit-input");
        if (!input) return;

        const item = input.closest(".sector-item");
        const name = item.querySelector(".name-sector");

        // ENTER → salva edição
        if (e.key === "Enter") {
            name.textContent = input.value.trim() || "SETOR SEM NOME";
            input.style.display = "none";
            name.style.display = "block";
        }

        // ESC → cancela edição
        if (e.key === "Escape") {
            input.style.display = "none";
            name.style.display = "block";
        }
    });

    // EDIÇÃO DE SETOR — CLIQUE FORA (blur em captura)
    sectorList.addEventListener("blur", (e) => {
            const input = e.target.closest(".edit-input");
            if (!input) return;

            const item = input.closest(".sector-item");
            const name = item.querySelector(".name-sector");

            // Salva ao perder foco
            name.textContent = input.value.trim() || "SETOR SEM NOME";
            input.style.display = "none";
            name.style.display = "block";
        },
        true // necessário porque blur não faz bubble
    );

    // ATIVAR SETOR (estado visual)
    sectorList.addEventListener("click", (e) => {
        // Ignora cliques que não pertencem a um setor
        const item = e.target.closest(".sector-item");
        if (!item) return;

        // Remove estado ativo de todos
        sectorList
            .querySelectorAll(".sector-item.active")
            .forEach(el => el.classList.remove("active"));

        // Ativa o setor clicado
        item.classList.add("active");
    });

    /* ============================= FUNÇÃO BASE RACI ============================= */
    function criarTaskContainerRaci() {
        const td = document.createElement("td");
        td.className = "container-raci";

        const div = document.createElement("div");
        div.className = "col-raci";

        const span = document.createElement("span");
        span.className = "circulo none-cir";
        span.textContent = "-";

        div.appendChild(span);
        td.appendChild(div);

        return td;
    }

    /* ============================= MATRIZ MEMBRO ============================= */
    // CRIAÇÃO DE MEMBRO
    const btnAddMember = document.getElementById("btnAddMember")
    const ListMerbers = document.getElementById("list-members")

    function criarTaskContainerRaci() {
        const td = document.createElement("td");
        td.className = "container-raci";

        const div = document.createElement("div");
        div.className = "col-raci";

        const span = document.createElement("span");
        span.className = "circulo none-cir";
        span.textContent = "-";

        div.appendChild(span);
        td.appendChild(div);

        return td;
    }

    function criarMember(nome = "Membro") {
        const th = document.createElement("th");
        th.className = "member";

        const div = document.createElement("div");
        div.className = "member-container";

        const span = document.createElement("span");
        span.className = "member-name";
        span.textContent = nome;

        const input = document.createElement("input");
        input.type = "text";
        input.className = "input-member";
        input.style.display = "none";

        const btnDeletemember = document.createElement("button");
        btnDeletemember.className = "remove-member";
        btnDeletemember.type = "button";
        btnDeletemember.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

        th.append(div);
        div.append(span, input, btnDeletemember);
        return th;
    }

    btnAddMember.addEventListener("click", () => {
        const member = criarMember();
        ListMerbers.appendChild(member);

        // adiciona uma nova coluna RACI em todas as tarefas existentes
        const tarefas = document.querySelectorAll(".tarefa_item");

        tarefas.forEach((tarefa) => {
            const novaColunaRaci = criarTaskContainerRaci();
            const colunaClose = tarefa.querySelector(".close-task");
            tarefa.insertBefore(novaColunaRaci, colunaClose);
        });
    });

    // DELETAR MEMBRO
    ListMerbers.addEventListener("click", (e) => {
        const btnDeletemember = e.target.closest(".remove-member");
        if (!btnDeletemember) return;

        // Membro que será removido
        const memberItem = btnDeletemember.closest(".member");
        if (!memberItem) return;

        // Descobre o índice da coluna do membro (posição no thead)
        const members = Array.from(ListMerbers.querySelectorAll(".member"));
        const memberIndex = members.indexOf(memberItem);

        if (memberIndex === -1) return;

        // Para cada tarefa, remove a coluna RACI correspondente ao membro
        const tarefas = document.querySelectorAll(".tarefa_item");

        tarefas.forEach((tarefa) => {
            const colunasRaci = tarefa.querySelectorAll(".container-raci");

            // Remove a coluna RACI exatamente na mesma posição do membro
            if (colunasRaci[memberIndex]) {
                colunasRaci[memberIndex].remove();
            }
        });

        // Remove o membro do cabeçalho
        memberItem.remove();
    });

    // EDIT DE MEMBRO
    ListMerbers.addEventListener("dblclick", (e) => {
        // Só entra em edição se o duplo clique for no nome
        const name = e.target.closest(".member-name");
        if (!name) return;

        const item = name.closest(".member");
        const input = item.querySelector(".input-member");

        // Sincroniza valor atual
        input.value = name.textContent;

        // Alterna visualmente para modo edição
        name.style.display = "none";
        input.style.display = "block";

        // UX: foco imediato no input
        input.focus();
        input.select();
    });

    ListMerbers.addEventListener("keydown", (e) => {
        const input = e.target.closest(".input-member");
        if (!input) return;

        const item = input.closest(".member");
        const name = item.querySelector(".member-name");

        // ENTER → salva edição
        if (e.key === "Enter") {
            name.textContent = input.value.trim() || "Membro";
            input.style.display = "none";
            name.style.display = "block";
        }

        // ESC → cancela edição
        if (e.key === "Escape") {
            input.style.display = "none";
            name.style.display = "block";
        }
    });

    ListMerbers.addEventListener("blur", (e) => {
            const input = e.target.closest(".input-member");
            if (!input) return;

            const item = input.closest(".member");
            const name = item.querySelector(".member-name");

            // Salva ao perder foco
            name.textContent = input.value.trim() || "Membro";
            input.style.display = "none";
            name.style.display = "block";
        },
        true // necessário porque blur não faz bubble
    );

    /* ============================= MATRIZ TAREFA ============================= */
    const btnAddTask = document.getElementById("btnAddTask");
    const taskList = document.getElementById("taskList");

    // Linha fixa do botão "Adicionar Tarefa"
    // (use um id nela no HTML para ficar profissional)
    const addTaskRow = taskList.querySelector("tr:last-child");

    function criarTask(nome = "Nova Tarefa") {
        const tr = document.createElement("tr");
        tr.className = "tarefa_item";

        const div = document.createElement("div");
        div.className = "task-text";

        // Nome da tarefa
        const tdName = document.createElement("td");
        tdName.className = "container_nametask";

        const span = document.createElement("span");
        span.className = "tarefa-name";
        span.textContent = nome;

        const input = document.createElement("input");
        input.type = "text";
        input.className = "input-task";
        input.style.display = "none";

        div.append(span, input);
        tdName.append(div)
        tr.appendChild(tdName);

        // Colunas RACI (uma por membro)
        const membros = document.querySelectorAll(".member");
        membros.forEach(() => {
            tr.appendChild(criarTaskContainerRaci());
        });

        // Botão remover
        const tdClose = document.createElement("td");
        tdClose.className = "close-task";

        const btnClose = document.createElement("button");
        btnClose.type = "button";
        btnClose.className = "btn_closetask";
        btnClose.setAttribute("aria-label", "Remover tarefa");
        btnClose.innerHTML = `<i class="fa-solid fa-trash"></i>`;

        tdClose.appendChild(btnClose);
        tr.appendChild(tdClose);

        return tr;
    }

    btnAddTask.addEventListener("click", () => {
        const novaTask = criarTask();
        taskList.insertBefore(novaTask, addTaskRow);
    });

    // DELETAR TAREFA
    taskList.addEventListener("click", (e) => {
        // Verifica se o clique veio de um botão de deletar
        const btnDeleteTarefa = e.target.closest(".btn_closetask");
        if (!btnDeleteTarefa) return;

        // Sobe no DOM até encontrar a tarefa correspondente
        const TarefaItem = btnDeleteTarefa.closest(".tarefa_item");
        if (!TarefaItem) return;

        TarefaItem.remove();
    });

    // EDIT DE TAREFA
    taskList.addEventListener("dblclick", (e) => {
        // Só entra em edição se o duplo clique for no nome
        const name = e.target.closest(".tarefa-name");
        if (!name) return;

        const item = name.closest(".tarefa_item");
        const input = item.querySelector(".input-task");

        // Sincroniza valor atual
        input.value = name.textContent;

        // Alterna visualmente para modo edição
        name.style.display = "none";
        input.style.display = "-webkit-box";

        // UX: foco imediato no input
        input.focus();
        input.select();
    })

    taskList.addEventListener("keydown", (e) => {
        const input = e.target.closest(".input-task");
        if (!input) return;

        const item = input.closest(".tarefa_item");
        const name = item.querySelector(".tarefa-name");

        // ENTER → salva edição
        if (e.key === "Enter") {
            name.textContent = input.value.trim() || "Tarefa";
            input.style.display = "none";
            name.style.display = "block";
        }

        // ESC → cancela edição
        if (e.key === "Escape") {
            input.style.display = "none";
            name.style.display = "block";
        }
    });

    taskList.addEventListener("blur", (e) => {
            const input = e.target.closest(".input-task");
            if (!input) return;

            const item = input.closest(".tarefa_item");
            const name = item.querySelector(".tarefa-name");

            // Salva ao perder foco
            name.textContent = input.value.trim() || "Tarefa";
            input.style.display = "none";
            name.style.display = "block";
        }, true // necessário porque blur não faz bubble
    );
    
    /* ============================= MATRIZ SHOW TEXT ============================= */
    const showText = document.getElementById("show_text");

    document.addEventListener("mouseover", (e) => {
        const target = e.target.closest(".member-name, .tarefa-name");
        if (!target) return;

        let isClamped = false;

        if (target.classList.contains("member-name")) {
            // corte horizontal (1 linha)
            isClamped = target.scrollWidth > target.clientWidth;
        }

        if (target.classList.contains("tarefa-name")) {
            // corte vertical (line-clamp)
            isClamped = target.scrollHeight > target.clientHeight;
        }

        if (!isClamped) return;

        showText.textContent = target.textContent;
        showText.style.display = "block";

        const rect = target.getBoundingClientRect();
        showText.style.top = `${rect.bottom + window.scrollY + 6}px`;
        showText.style.left = `${rect.left + window.scrollX}px`;
    });

    document.addEventListener("mouseout", (e) => {
        const target = e.target.closest(".member-name, .tarefa-name");
        if (!target) return;

        showText.style.display = "none";
    });





    /* ============================= MATRIZ MENU ============================= */
    const MenuRaci = document.getElementById("menu-raci");

    taskList.addEventListener("click", (e) => {
        const circulo = e.target.closest(".circulo");
        if (!circulo) return;

        e.stopPropagation();

        circuloAtivo = circulo;
        MenuRaci.style.display = "flex";

        const rect = circulo.getBoundingClientRect();
        const menuRect = MenuRaci.getBoundingClientRect();

        MenuRaci.style.top = `${rect.bottom + window.scrollY + 6}px`;
        MenuRaci.style.left =
            `${rect.left + window.scrollX + (rect.width / 2) - (menuRect.width / 2)}px`;
    });


    MenuRaci.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-circulo");
        if (!btn || !circuloAtivo) return;

        const valor = btn.dataset.valor;

        // limpa classes anteriores
        circuloAtivo.className = "circulo";

        // aplica novo valor
        circuloAtivo.textContent = valor;

        // aplica classe visual correspondente
        if (valor !== "-") {
            circuloAtivo.classList.add(`cir-${valor.toLowerCase()}`);
        } else {
            circuloAtivo.classList.add("none-cir");
        }

        // fecha menu
        MenuRaci.style.display = "none";
        circuloAtivo = null;
    });

    document.addEventListener("click", (e) => {
        if (
            !MenuRaci.contains(e.target)
        ) {
            MenuRaci.style.display = "none";
            circuloAtivo = null;
        }
    });


    
});


