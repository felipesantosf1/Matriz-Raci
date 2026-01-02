document.addEventListener("DOMContentLoaded", () => {

    /* ============================= REFS ============================= */
    const sectorList = document.getElementById("sectorList");
    const btnAddSector = document.getElementById("btnAddSector");
    const tableWrapper = document.querySelector(".matrix-table-wrapper");

    let dados = null;
    let setorAtivo = null;
    let circuloAtivo = null; 

    /* ============================= SALVAR JSON ============================= */
    function salvar() {                     
        if (window.api && dados) {
            window.api.salvar(dados);
        }
    }

    /* ============================= FUNÇÃO VISUAL RACI ============================= */
    function aplicarRaciVisual(span, valor) {  
        span.className = "circulo";
        span.textContent = valor;

        if (valor !== "-") {
            span.classList.add(`cir-${valor.toLowerCase()}`);
        } else {
            span.classList.add("none-cir");
        }
    }

    /* ============================= FETCH JSON ============================= */
    fetch("../data/racisave.json")
        .then(response => response.json())
        .then(data => {
            dados = data;

            data.setores.forEach((setor, index) => {
                const li = criarSetor(setor.nome);

                if (index === 0) {
                    li.classList.add("active");
                    setorAtivo = setor;

                    const btnDelete = li.querySelector(".delete-sector");
                    btnDelete.classList.add("not-close");
                }

                li.addEventListener("click", () => {
                    ativarSetor(li, setor);
                });

                sectorList.appendChild(li);
            });

            if (setorAtivo) {
                renderTabelaRaci(setorAtivo);
            }
        })
        .catch(err => console.error("Erro ao carregar JSON:", err));

    /* ============================= CRIAR SETOR ============================= */
    function criarSetor(nome = "NOVO SETOR") {
        const li = document.createElement("li");
        li.className = "sector-item";

        const span = document.createElement("span");
        span.className = "name-sector";
        span.textContent = nome;

        const input = document.createElement("input");
        input.type = "text";
        input.className = "edit-input";
        input.style.display = "none";

        const btnDeleteSector = document.createElement("button");
        btnDeleteSector.className = "delete-sector";
        btnDeleteSector.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

        li.append(span, input, btnDeleteSector);
        return li;
    }

    /* ============================= ATIVAR SETOR ============================= */
    function ativarSetor(li, setor) {
        sectorList
            .querySelectorAll(".sector-item.active")
            .forEach(el => el.classList.remove("active"));

        li.classList.add("active");
        setorAtivo = setor;

        renderTabelaRaci(setorAtivo);
    }

    /* ============================= BOTÃO CRIAR SETOR ============================= */
    btnAddSector.addEventListener("click", () => {
        const novoSetor = {
            id: `s${Date.now()}`,
            nome: "NOVO SETOR",
            membros: [
                {
                    id: `m${Date.now()}`,
                    nome: "Membro"
                }
            ],
            Tarefas: [
                {
                    id: `t${Date.now()}`,
                    nome: "Tarefa",
                    raci: {
                        [`m${Date.now()}`]: "-"
                    }
                }
            ]
        };

        dados.setores.push(novoSetor);   
        salvar();                        

        const li = criarSetor(novoSetor.nome);
        li.addEventListener("click", () => ativarSetor(li, novoSetor));

        sectorList.appendChild(li);
        ativarSetor(li, novoSetor);
    });

    // DELETAR SETOR (delegação)
    sectorList.addEventListener("click", (e) => {
        // Verifica se o clique veio de um botão de deletar
        const btnDelete = e.target.closest(".delete-sector");
        if (!btnDelete) return;

        // Sobe no DOM até encontrar o setor correspondente
        const sectorItem = btnDelete.closest(".sector-item");
        const index = [...sectorList.children].indexOf(sectorItem);

        dados.setores.splice(index, 1);  
        salvar();

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
            const novoNome = input.value.trim() || "SETOR SEM NOME";
            name.textContent = novoNome;

            // >>> SINCRONIZA COM JSON
            const setores = Array.from(sectorList.querySelectorAll(".sector-item"));
            const index = setores.indexOf(item);

            if (index !== -1) {
                dados.setores[index].nome = novoNome; 
                salvar();                              
            }

            input.style.display = "none";
            name.style.display = "block";
        }

        // ESC → cancela edição (não salva)
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
        }, true // necessário porque blur não faz bubble
    );

    /* ============================= MATRIZ MEMBRO ============================= */

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

        div.append(span, input, btnDeletemember);
        th.append(div);
        return th;
    }

    /* ============================= MATRIZ TAREFAS ============================= */
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

    /* ============================= RENDER TABELA ============================= */
    function renderTabelaRaci(setor) {

        const MenuRaci = document.getElementById("menu-raci");   
        const showText = document.getElementById("show_text");  

        tableWrapper.innerHTML = "";

        tableWrapper.appendChild(MenuRaci);
        tableWrapper.appendChild(showText);

        const table = document.createElement("table");
        table.className = "raci-table";
        table.id = "raciTable";

        /* -------- THEAD -------- */
        const thead = document.createElement("thead");
        const trHead = document.createElement("tr");
        trHead.id = "list-members";

        const thTask = document.createElement("th");
        thTask.className = "task-column";

        const btnAddMember = document.createElement("button");
        btnAddMember.id = "btnAddMember";
        btnAddMember.className = "btn btn-add-Member";
        btnAddMember.textContent = "Adicionar Membro";

        thTask.appendChild(btnAddMember);
        trHead.appendChild(thTask);

        setor.membros.forEach((membro, index) => {
            const th = document.createElement("th");
            th.className = "member";

            const container = document.createElement("div");
            container.className = "member-container";

            const span = document.createElement("span");
            span.className = "member-name";
            span.textContent = membro.nome;

            const input = document.createElement("input");
            input.className = "input-member";
            input.type = "text";

            const btnRemove = document.createElement("button");
            btnRemove.className = "remove-member";
            btnRemove.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

            if (index === 0) {
                btnRemove.classList.add("not-close"); 
            }

            container.append(span, input, btnRemove);
            th.appendChild(container);
            trHead.appendChild(th);
        });

        thead.appendChild(trHead);
        table.appendChild(thead);

        

        /* -------- TBODY -------- */
        const tbody = document.createElement("tbody");
        tbody.id = "taskList";

        setor.Tarefas.forEach((tarefa, index) => {
            const tr = document.createElement("tr");
            tr.className = "tarefa_item";

            const tdTask = document.createElement("td");
            tdTask.className = "container_nametask";

            const taskText = document.createElement("div");
            taskText.className = "task-text";

            const spanTask = document.createElement("span");
            spanTask.className = "tarefa-name";
            spanTask.textContent = tarefa.nome;

            const inputTask = document.createElement("input");
            inputTask.className = "input-task";
            inputTask.type = "text";

            taskText.append(spanTask, inputTask);
            tdTask.appendChild(taskText);
            tr.appendChild(tdTask);

            setor.membros.forEach(membro => {
                const tdRaci = document.createElement("td");
                tdRaci.className = "container-raci";

                const col = document.createElement("div");
                col.className = "col-raci";

                const span = document.createElement("span");
                const valor = tarefa.raci?.[membro.id] || "-";
                aplicarRaciVisual(span, valor); 

                col.appendChild(span);
                tdRaci.appendChild(col);
                tr.appendChild(tdRaci);
            });

            const tdClose = document.createElement("td");
            tdClose.className = "close-task";

            if (index === 0) {
                tdClose.classList.add("not-close"); 
            }

            const btnDelete = document.createElement("button");
            btnDelete.className = "btn_closetask";
            btnDelete.innerHTML = `<i class="fa-solid fa-trash"></i>`;

            tdClose.appendChild(btnDelete);
            tr.appendChild(tdClose);

            tbody.appendChild(tr);
        });

        const trAdd = document.createElement("tr");
        const tdAdd = document.createElement("td");
        tdAdd.className = "add-task";

        const btnAddTask = document.createElement("button");
        btnAddTask.id = "btnAddTask";
        btnAddTask.className = "btn btn-add-task";
        btnAddTask.textContent = "Adicionar Tarefa";

        tdAdd.appendChild(btnAddTask);
        trAdd.appendChild(tdAdd);
        tbody.appendChild(trAdd);

        table.appendChild(tbody);

        tableWrapper.appendChild(table);

        tableWrapper.appendChild(MenuRaci);   
        tableWrapper.appendChild(showText);

        /* ================= EVENTO ADICIONAR MEMBRO ================= */
        const listMembers = document.getElementById("list-members");
        const btnAddMemberRef = document.getElementById("btnAddMember");

        btnAddMemberRef.addEventListener("click", () => {
            const id = `m${Date.now()}`;

            setorAtivo.membros.push({ id, nome: "Membro" }); 

            // adiciona "-" para o novo membro em todas as tarefas
            setorAtivo.Tarefas.forEach(tarefa => {
                tarefa.raci[id] = "-"; 
            });

            salvar(); 
            renderTabelaRaci(setorAtivo); 
        });



        // DELETAR MEMBRO
        listMembers.addEventListener("click", (e) => {
            const btnDeletemember = e.target.closest(".remove-member");
            if (!btnDeletemember) return;

            const memberItem = btnDeletemember.closest(".member");
            if (!memberItem) return;

            // índice do membro no JSON
            const members = Array.from(listMembers.querySelectorAll(".member"));
            const memberIndex = members.indexOf(memberItem);
            if (memberIndex === -1) return;

            const memberId = setorAtivo.membros[memberIndex].id; 

            // remove o membro do JSON
            setorAtivo.membros.splice(memberIndex, 1); 

            // remove o RACI desse membro em todas as tarefas
            setorAtivo.Tarefas.forEach(tarefa => {
                delete tarefa.raci[memberId]; 
            });

            salvar(); 
            renderTabelaRaci(setorAtivo); 
        });


        // EDIT DE MEMBRO
        listMembers.addEventListener("dblclick", (e) => {
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

        listMembers.addEventListener("keydown", (e) => {
            const input = e.target.closest(".input-member");
            if (!input) return;

            const item = input.closest(".member");
            const name = item.querySelector(".member-name");

            // ENTER → salva edição
            if (e.key === "Enter") {
                const novoNome = input.value.trim() || "Membro";
                name.textContent = novoNome;

                // >>> SINCRONIZA COM JSON
                const members = Array.from(listMembers.querySelectorAll(".member"));
                const index = members.indexOf(item);
                if (index !== -1) {
                    setorAtivo.membros[index].nome = novoNome; 
                    salvar();                                  
                }

                input.style.display = "none";
                name.style.display = "block";
            }

            // ESC → cancela edição (não salva)
            if (e.key === "Escape") {
                input.style.display = "none";
                name.style.display = "block";
            }
        });


        listMembers.addEventListener("blur", (e) => {
                const input = e.target.closest(".input-member");
                if (!input) return;

                const item = input.closest(".member");
                const name = item.querySelector(".member-name");

                // Salva ao perder foco
                name.textContent = input.value.trim() || "Membro";
                input.style.display = "none";
                name.style.display = "block";
            }, true // necessário porque blur não faz bubble
        );

        /* ================= EVENTO ADICIONAR TAREFA ================= */
        const taskList = document.getElementById("taskList");
        /* const addTaskRow = taskList.querySelector("tr:last-child"); */

        btnAddTask.addEventListener("click", () => {
            const id = `t${Date.now()}`;
            const raci = {};

            // cria o raci padrão para todos os membros
            setorAtivo.membros.forEach(membro => {
                raci[membro.id] = "-";
            });

            setorAtivo.Tarefas.push({
                id,
                nome: "Tarefa",
                raci
            }); 

            salvar(); 
            renderTabelaRaci(setorAtivo); 
        });


        // DELETAR TAREFA
        taskList.addEventListener("click", (e) => {
            const btnDeleteTarefa = e.target.closest(".btn_closetask");
            if (!btnDeleteTarefa) return;

            const tarefaItem = btnDeleteTarefa.closest(".tarefa_item");
            if (!tarefaItem) return;

            // índice da tarefa no JSON
            const tarefas = Array.from(taskList.querySelectorAll(".tarefa_item"));
            const index = tarefas.indexOf(tarefaItem);
            if (index === -1) return;

            setorAtivo.Tarefas.splice(index, 1); 
            salvar();                            
            renderTabelaRaci(setorAtivo);        
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
                const novoNome = input.value.trim() || "Tarefa";
                name.textContent = novoNome;

                // >>> SINCRONIZA COM JSON
                const tarefas = Array.from(taskList.querySelectorAll(".tarefa_item"));
                const index = tarefas.indexOf(item);
                if (index !== -1) {
                    setorAtivo.Tarefas[index].nome = novoNome; 
                    salvar();                                  
                }

                input.style.display = "none";
                name.style.display = "block";
            }

            // ESC → cancela edição (não salva)
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
    

        /* ============================= MATRIZ MENU ============================= */

        taskList.addEventListener("click", (e) => {
            const circulo = e.target.closest(".circulo");
            if (!circulo) return;

            e.stopPropagation();

            circuloAtivo = circulo;
            MenuRaci.style.display = "flex";

            const rect = circulo.getBoundingClientRect();
            const menuRect = MenuRaci.getBoundingClientRect();

            MenuRaci.style.top = `${rect.bottom + window.scrollY + 6}px`;
            MenuRaci.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (menuRect.width / 2)}px`;
        });

        MenuRaci.addEventListener("click", (e) => {
            const btn = e.target.closest(".btn-circulo");
            if (!btn || !circuloAtivo) return;

            const valor = btn.dataset.valor;

            // ===== VISUAL (centralizado) =====
            aplicarRaciVisual(circuloAtivo, valor); 

            // ===== SINCRONIZA COM JSON =====
            const tarefaItem = circuloAtivo.closest(".tarefa_item");
            const tarefaIndex = Array
                .from(document.querySelectorAll(".tarefa_item"))
                .indexOf(tarefaItem);

            const colunas = Array.from(tarefaItem.querySelectorAll(".container-raci"));
            const colunaIndex = colunas.indexOf(circuloAtivo.closest(".container-raci"));

            const membroId = setorAtivo.membros[colunaIndex].id; 

            setorAtivo.Tarefas[tarefaIndex].raci[membroId] = valor; 
            salvar();                                               

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

        /* ============================= MATRIZ SHOW TEXT ============================= */
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

    }

});
