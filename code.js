document.addEventListener("DOMContentLoaded", () => {  

    // -------------------------------
    // REFS
    // -------------------------------
    const btnAddMember = document.getElementById("btn-member");
    const btnAddTask = document.getElementById("btn-task");
    const table = document.querySelector(".matriz table");
    const theadRow = table.querySelector("thead tr");
    const tbody = document.querySelector(".container-lista-task");
    const menuRaci = document.getElementById("menu-raci");

    let raciTargetCell = null; 
    let currentSetorId = null; 

    // ========================================================================
    // ITENS PADRÃO (membro, setor, tarefa)
    // ========================================================================
    function criarItensPadrao() {

        // --------------------------
        // MEMBRO PADRÃO
        // --------------------------
        if (theadRow.querySelectorAll(".member").length === 0) {
            const th = document.createElement("th");
            th.classList.add("member");

            // Wrapper igual ao dos novos membros
            const container = document.createElement("div");
            container.classList.add("member-wrapper");

            const span = document.createElement("span");
            span.textContent = "Membro 1";
            span.addEventListener("click", () => enableInlineEdit(span));

            const btnRemove = document.createElement("button");
            btnRemove.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
            // torna o primeiro membro não removível
            btnRemove.style.opacity = "0.35";
            btnRemove.style.cursor = "not-allowed";
            btnRemove.disabled = true;

            // montar exatamente igual ao addMember
            container.appendChild(span);
            container.appendChild(btnRemove);

            th.appendChild(container);
            theadRow.appendChild(th);
        }

        // --------------------------
        // TAREFA PADRÃO
        // --------------------------
        if (tbody.querySelectorAll(".linha-tarefa").length === 0) {
            const row = document.createElement("tr");
            row.classList.add("linha-tarefa");

            const firstTd = document.createElement("td");
            firstTd.classList.add("container-name-task");

            const divName = document.createElement("div");
            divName.classList.add("nome-tarefa");

            const spanTask = document.createElement("span");
            spanTask.textContent = "Tarefa 1";
            spanTask.addEventListener("click", () => enableInlineEdit(spanTask));

            divName.appendChild(spanTask);
            firstTd.appendChild(divName);
            row.appendChild(firstTd);

            const totalMembers = theadRow.querySelectorAll(".member").length;

            for (let i = 0; i < totalMembers; i++) {
                const td = document.createElement("td");
                td.innerHTML = `
                    <div class="col-raci">
                        <span class="circulo circulo-none">-</span>
                    </div>
                `;
                td.querySelector(".circulo").addEventListener("click", (e) => openRaciMenu(e, td));
                row.appendChild(td);
            }

            const tdTrash = document.createElement("td");
            tdTrash.classList.add("close-task");
            tdTrash.innerHTML = `<button><i class="fa-solid fa-trash"></i></button>`;
            // primeira tarefa não removível
            tdTrash.querySelector("button").style.opacity = "0.35";
            tdTrash.querySelector("button").style.cursor = "not-allowed";
            tdTrash.querySelector("button").disabled = true;
            row.appendChild(tdTrash);

            tbody.insertBefore(row, tbody.querySelector(".add-task").parentElement);
        }
    }

    criarItensPadrao();



    // ========================================================================
    // FUNÇÃO DE EDIÇÃO INLINE — TIPO NOTION
    // ========================================================================
    function enableInlineEdit(spanElement) {

        const oldValue = spanElement.textContent.trim();
        const input = document.createElement("input");

        input.type = "text";
        input.value = oldValue;
        input.classList.add("input-inline-edit");

        spanElement.replaceWith(input);
        input.focus();
        input.select();

        function finishEdit() {
            let newValue = input.value.trim();
            if (newValue === "") newValue = oldValue;

            const newSpan = document.createElement("span");
            newSpan.textContent = newValue;
            newSpan.addEventListener("click", () => enableInlineEdit(newSpan));
            input.replaceWith(newSpan);

            // salvamos a mudança no setor atual (se houver)
            saveCurrentSetor();
        }

        input.addEventListener("blur", finishEdit);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") finishEdit();
        });
    }




    



    










    // ========================================================================
    // FUNÇÃO: Sincronizar TODAS as linhas com o número de membros
    // ========================================================================
    function syncAllRowsToMembers() {
        const membersCount = theadRow.querySelectorAll(".member").length;

        tbody.querySelectorAll(".linha-tarefa").forEach(row => {

            const tds = Array.from(row.querySelectorAll("td"));

            const hasTrash = row.querySelector(".close-task") !== null;
            const currentRaciCells = hasTrash ? (tds.length - 2) : (tds.length - 1);

            if (currentRaciCells < membersCount) {

                const missing = membersCount - currentRaciCells;

                for (let i = 0; i < missing; i++) {
                    const td = document.createElement("td");
                    td.innerHTML = `
                        <div class="col-raci">
                            <span class="circulo circulo-none">-</span>
                        </div>
                    `;
                    td.querySelector(".circulo").addEventListener("click", (e) => openRaciMenu(e, td));

                    row.insertBefore(td, row.querySelector(".close-task"));
                }
            }

            if (currentRaciCells > membersCount) {
                const excess = currentRaciCells - membersCount;

                for (let i = 0; i < excess; i++) {
                    row.removeChild(row.querySelectorAll("td")[currentRaciCells - i]);
                }
            }
        });
    }


    // ========================================================================
    // ADICIONAR MEMBRO
    // ========================================================================
    btnAddMember.addEventListener("click", () => {

        const th = document.createElement("th");
        th.classList.add("member");

        // CREATE CONTAINER FIX
        const container = document.createElement("div");
        container.classList.add("member-wrapper"); // classe para estilizar no CSS

        const span = document.createElement("span");
        span.textContent = "Novo Membro";
        span.addEventListener("click", () => enableInlineEdit(span));

        const btnRemove = document.createElement("button");
        btnRemove.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

        btnRemove.addEventListener("click", () => {
            const index = Array.from(theadRow.children).indexOf(th);

            theadRow.removeChild(th);

            tbody.querySelectorAll(".linha-tarefa").forEach(row => {
                const tds = row.querySelectorAll("td");
                tds[index - 1]?.remove();
            });

            syncAllRowsToMembers();

            saveCurrentSetor();
        });

        // COLOCA SPAN/INPUT E BOTÃO NO CONTAINER
        container.appendChild(span);
        container.appendChild(btnRemove);

        // COLOCA O CONTAINER NO <th>
        th.appendChild(container);
        theadRow.appendChild(th);

        syncAllRowsToMembers();

        saveCurrentSetor();
    });

    // ========================================================================
    // ADICIONAR TAREFA
    // ========================================================================
    btnAddTask.addEventListener("click", () => {

        const newRow = document.createElement("tr");
        newRow.classList.add("linha-tarefa");

        const firstTd = document.createElement("td");
        firstTd.classList.add("container-name-task");

        const divName = document.createElement("div");
        divName.classList.add("nome-tarefa");

        const spanTask = document.createElement("span");
        spanTask.textContent = "Nova Tarefa";
        spanTask.addEventListener("click", () => enableInlineEdit(spanTask));

        divName.appendChild(spanTask);
        firstTd.appendChild(divName);
        newRow.appendChild(firstTd);

        const members = theadRow.querySelectorAll(".member").length;
        for (let i = 0; i < members; i++) {
            const td = document.createElement("td");
            td.innerHTML = `
                <div class="col-raci">
                    <span class="circulo circulo-none">-</span>
                </div>
            `;
            td.querySelector(".circulo").addEventListener("click", (e) => openRaciMenu(e, td));
            newRow.appendChild(td);
        }

        const tdTrash = document.createElement("td");

        tdTrash.classList.add("close-task-container");
        
        tdTrash.innerHTML = `
            <div class="close-task">
                <button>
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        tdTrash.querySelector("button").addEventListener("click", () => {
            newRow.remove();
            saveCurrentSetor();
        });

        newRow.appendChild(tdTrash);

        tbody.insertBefore(newRow, tbody.querySelector(".add-task").parentElement);

        syncAllRowsToMembers();

        saveCurrentSetor();
    });

    // ========================================================================
    // MENU RACI
    // ========================================================================
    function openRaciMenu(event, td) {
        raciTargetCell = td;

        const rect = td.getBoundingClientRect();
        menuRaci.style.display = "flex";
        menuRaci.style.left = `${rect.left + window.scrollX}px`;
        menuRaci.style.top = `${rect.bottom + window.scrollY + 5}px`;
    }

    menuRaci.querySelectorAll(".btn-circulo").forEach((btn) => {

        btn.addEventListener("click", () => {
            if (raciTargetCell) {
                const span = raciTargetCell.querySelector(".circulo");
                const value = btn.dataset.valor;

                span.classList.remove("cir-r", "cir-a", "cir-c", "cir-i", "cir-none");

                span.textContent = value;

                switch (value) {
                    case "R": span.classList.add("cir-r"); break;
                    case "A": span.classList.add("cir-a"); break;
                    case "C": span.classList.add("cir-c"); break;
                    case "I": span.classList.add("cir-i"); break;
                    case "none": span.classList.add("cir-none"); break
                }
            }

            menuRaci.style.display = "none";

            // salvar escolha
            saveCurrentSetor();
        });
    });

    document.addEventListener("click", (e) => {
        if (!menuRaci.contains(e.target) && !e.target.classList.contains("circulo")) {
            menuRaci.style.display = "none";
        }
    });



    // ========================================================================
    // EDIÇÃO INLINE DOS ITENS EXISTENTES
    // ========================================================================
    document.querySelectorAll(".nome-tarefa span").forEach((span) => {
        span.addEventListener("click", () => enableInlineEdit(span));
    });

    document.querySelectorAll("th.member span").forEach((span) => {
        span.addEventListener("click", () => enableInlineEdit(span));
    });



    // ========================================================================
    // --- SETORES ---
    // ========================================================================
    const btnAddSetor = document.querySelector(".btn-add-setor");
    const setorMenu = document.querySelector(".setor-menu ul");

    // helpers para armazenamento
    function storageKeyForSetor(id) {
        return `raci_setor_${id}`;
    }

    function serializeCurrentMatrix() {
        // members
        const memberThs = Array.from(theadRow.querySelectorAll("th.member"));
        const members = memberThs.map(th => {
            const span = th.querySelector("span");
            return span ? span.textContent.trim() : "Membro";
        });

        // tasks
        const tasks = [];
        tbody.querySelectorAll(".linha-tarefa").forEach(row => {
            const nameSpan = row.querySelector(".nome-tarefa span");
            const taskName = nameSpan ? nameSpan.textContent.trim() : "Tarefa";
            const tds = Array.from(row.querySelectorAll("td"));
            const hasTrash = row.querySelector(".close-task") !== null;
            const raciCells = [];
            // raci cells start at index 1 (because first td is name), and end before trash if exists
            const endIndex = hasTrash ? (tds.length - 1) : tds.length;
            for (let i = 1; i < endIndex; i++) {
                const span = tds[i].querySelector(".circulo");

                raciCells.push({
                    value: span ? span.textContent.trim() : "-",
                    classe: span ? span.className : "circulo circulo-none"
                });
                
            }
            tasks.push({ name: taskName, raci: raciCells });
        });

        return { members, tasks };
    }

    function renderMatrixFromData(data) {
        // limpa membros existentes (mantém o primeiro th .add-member)
        Array.from(theadRow.querySelectorAll("th.member")).forEach(th => th.remove());

        // remove todas linhas de tarefa
        Array.from(tbody.querySelectorAll(".linha-tarefa")).forEach(tr => tr.remove());

        // render members
        data.members.forEach((mName, idx) => {
            const th = document.createElement("th");
            th.classList.add("member");
            const container = document.createElement("div");
            container.classList.add("member-wrapper");
            const span = document.createElement("span");
            span.textContent = mName || `Membro ${idx+1}`;
            span.addEventListener("click", () => enableInlineEdit(span));

            const btnRemove = document.createElement("button");
            btnRemove.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

            // Se for o primeiro membro, não permitir remoção
            if (idx === 0) {
                btnRemove.style.opacity = "0.35";
                btnRemove.style.cursor = "not-allowed";
                btnRemove.disabled = true;
            } else {
                btnRemove.addEventListener("click", () => {
                    const index = Array.from(theadRow.children).indexOf(th);
                    theadRow.removeChild(th);
                    tbody.querySelectorAll(".linha-tarefa").forEach(row => {
                        const tds = row.querySelectorAll("td");
                        tds[index - 1]?.remove();
                    });
                    syncAllRowsToMembers();
                    saveCurrentSetor();
                });
            }

            container.appendChild(span);
            container.appendChild(btnRemove);
            th.appendChild(container);
            theadRow.appendChild(th);
        });

        // render tasks
        data.tasks.forEach((task, taskIdx) => {
            const row = document.createElement("tr");
            row.classList.add("linha-tarefa");

            const firstTd = document.createElement("td");
            firstTd.classList.add("container-name-task");
            const divName = document.createElement("div");
            divName.classList.add("nome-tarefa");
            const spanTask = document.createElement("span");
            spanTask.textContent = task.name || "Tarefa";
            spanTask.addEventListener("click", () => enableInlineEdit(spanTask));
            divName.appendChild(spanTask);
            firstTd.appendChild(divName);
            row.appendChild(firstTd);

            // for each member, create raci cell using provided values (or '-')
            const membersCount = data.members.length;
            for (let i = 0; i < membersCount; i++) {
                const td = document.createElement("td");
                const raci = task.raci[i];
                const value = raci?.value ?? "-";
                const classe = raci?.classe ?? "circulo circulo-none";
                td.innerHTML = `
                    <div class="col-raci">
                        <span class="${classe}">${value}</span>
                    </div>
                `;
                td.querySelector(".circulo").addEventListener("click", (e) => openRaciMenu(e, td));
                row.appendChild(td);
            }

            const tdTrash = document.createElement("td");

            tdTrash.classList.add("close-task-container");
            
            tdTrash.innerHTML = `
                <div class="close-task">
                    <button>
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;

            // se for a primeira tarefa, desabilita remoção
            if (taskIdx === 0) {
                const btn = tdTrash.querySelector("button");
                btn.style.opacity = "0.35";
                btn.style.cursor = "not-allowed";
                btn.disabled = true;
            } else {
                tdTrash.querySelector("button").addEventListener("click", () => {
                    row.remove();
                    saveCurrentSetor();
                });
            }

            row.appendChild(tdTrash);

            tbody.insertBefore(row, tbody.querySelector(".add-task").parentElement);
        });

        syncAllRowsToMembers();
    }

    function saveCurrentSetor() {
        if (!currentSetorId) return;
        const data = serializeCurrentMatrix();
        localStorage.setItem(storageKeyForSetor(currentSetorId), JSON.stringify(data));
    }

    function loadSetor(id) {
        // antes de trocar, salva o setor atual
        if (currentSetorId) {
            saveCurrentSetor();
            // remove marcação visual de ativo se quiser (não obrigatório)
            const prev = setorMenu.querySelector(`[data-setor-id="${currentSetorId}"]`);
            if (prev) prev.classList.remove("active-setor");
        }

        currentSetorId = id;

        // carrega dados do localStorage se houver
        const raw = localStorage.getItem(storageKeyForSetor(id));
        if (raw) {
            try {
                const data = JSON.parse(raw);
                // se estrutura ok: render
                renderMatrixFromData(data);
            } catch (e) {
                console.error("Erro ao parsear setor:", e);
                // fallback para padrão
                renderMatrixFromData({ members: ["Membro 1"], tasks: [{ name: "Tarefa 1", raci: ["-"] }] });
            }
        } else {
            // cria estrutura padrão e salva
            const defaultData = {
                members: ["Membro 1"],
                tasks: [{
                    name: "Tarefa 1",
                    raci: [{
                        value: "-",
                        classe: "circulo circulo-none"
                    }]
                }]
            };
            renderMatrixFromData(defaultData);
            localStorage.setItem(storageKeyForSetor(id), JSON.stringify(defaultData));
        }

        // marca visual (opcional)
        const currentLi = setorMenu.querySelector(`[data-setor-id="${id}"]`);
        if (currentLi) currentLi.classList.add("active-setor");
    }

    // gera id e adiciona listeners ao li (usado tanto para o setor padrão quanto para novos)
    function setupSetorLi(li, autoOpen = false) {
        let id = li.getAttribute("data-setor-id");

        if (!id) {

            const isFirstSetor = setorMenu.querySelectorAll(".setor-item").length === 1;

            // Setor padrão ganha um ID fixo e permanente
            if (isFirstSetor) {
                id = "setor_padrao";
            } else {
                // Para novos setores, gera apenas 1 vez e nunca muda
                id = "s_" + crypto.randomUUID();
            }

            li.setAttribute("data-setor-id", id);
        }

        const btn = li.querySelector(".setor-btn");
        btn.addEventListener("click", () => {
            loadSetor(id);
            document.querySelectorAll(".setor-btn").forEach(b => b.classList.remove("setor-ativo"));
            btn.classList.add("setor-ativo");
        });

        const opcoes = li.querySelector(".setor-opcoes");
        if (opcoes) {
            opcoes.addEventListener("click", (e) => {
                e.stopPropagation();
                const menu = li.querySelector(".menu-setor-acao");
                menu.classList.toggle("open");
            });
        }

        const editar = li.querySelector(".editar-setor");
        if (editar) {
            editar.addEventListener("click", () => {
                const span = li.querySelector(".setor-btn span");
                enableInlineEdit(span);
            });
        }

        const excluir = li.querySelector(".excluir-setor");
        if (excluir && !excluir.disabled) {
            excluir.addEventListener("click", () => {
                const sid = li.getAttribute("data-setor-id");
                if (sid) localStorage.removeItem(storageKeyForSetor(sid));

                if (currentSetorId === sid) currentSetorId = null;

                li.remove();

                const first = setorMenu.querySelector(".setor-item");
                if (first) {
                    const firstId = first.getAttribute("data-setor-id");
                    if (firstId) loadSetor(firstId);
                } else {
                    createInitialSetorIfMissing();
                }
            });
        }

        if (autoOpen) loadSetor(id);
    }


    // ======================================================
    // ** SETOR PADRÃO (ÚNICA ALTERAÇÃO OBRIGATÓRIA) **
    // ======================================================
    if (setorMenu && setorMenu.querySelectorAll(".setor-item").length === 0) {

        const li = document.createElement("li");
        li.classList.add("setor-item");

        li.innerHTML = `
            <button class="setor-btn"><span>Setor Padrão</span></button>

            <button class="setor-opcoes">
                <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>

            <div class="menu-setor-acao">
                <button class="editar-setor"><i class="fa-regular fa-pen-to-square"></i></button>

                <button class="excluir-setor" style="opacity:0.35; cursor:not-allowed;" disabled>
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;

        setorMenu.appendChild(li);

        // setup id + listeners + abrir esse setor
        setupSetorLi(li, true);

        li.querySelector(".setor-btn").classList.add("setor-ativo");
    }

    // ======================================================
    // ADICIONAR NOVOS SETORES
    // ======================================================
    btnAddSetor?.addEventListener("click", () => {
        const li = document.createElement("li");
        li.classList.add("setor-item");

        li.innerHTML = `
            <button class="setor-btn"><span>Novo Setor</span></button>

            <button class="setor-opcoes">
                <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>

            <div class="menu-setor-acao">
                <button class="editar-setor"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="excluir-setor"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;

        setorMenu.appendChild(li);

        // setup id + listeners e abrir o setor recém-criado (para garantir que comece com estrutura padrão)
        setupSetorLi(li, true);
    });

    document.addEventListener("click", () => {
        document.querySelectorAll(".menu-setor-acao.open").forEach(menu => {
            menu.classList.remove("open");
        });
    });

    // se já existirem setores no DOM (por exemplo markup pré-existente), garantimos setup para todos
    if (setorMenu) {
        Array.from(setorMenu.querySelectorAll(".setor-item")).forEach((li, idx) => {
            if (!li.getAttribute("data-setor-id")) {
                // Se já tiver um botão excluir marcado como disabled no markup, o setup vai respeitar
                setupSetorLi(li, idx === 0); // abre o primeiro
            }
        });
    }

    // helper: cria um setor inicial caso não exista nenhum (usado se o usuário excluir tudo)
    function createInitialSetorIfMissing() {
        if (!setorMenu.querySelector(".setor-item")) {
            const li = document.createElement("li");
            li.classList.add("setor-item");
            li.innerHTML = `
                <button class="setor-btn"><span>Setor Padrão</span></button>

                <button class="setor-opcoes">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>

                <div class="menu-setor-acao">
                    <button class="editar-setor"><i class="fa-regular fa-pen-to-square"></i></button>

                    <button class="excluir-setor" style="opacity:0.35; cursor:not-allowed;" disabled>
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
            setorMenu.appendChild(li);
            setupSetorLi(li, true);
        }
    }

    // Caso o setor padrão (ou qualquer setor) já tenha sido salvo antes e exista um setor salvo no localStorage,
    // preferimos abrir o primeiro setor do menu (o setupSetorLi acima já faz open no primeiro item).
    // Se por algum motivo currentSetorId ainda é nulo (sem setores), garantimos criar um.
    if (!currentSetorId) {
        const first = setorMenu.querySelector(".setor-item");
        if (first) {
            const firstId = first.getAttribute("data-setor-id");
            if (firstId) loadSetor(firstId);
        } else {
            createInitialSetorIfMissing();
        }
    }

});
