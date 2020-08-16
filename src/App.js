import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Swal from "sweetalert2";
import { FiMoreVertical, FiChevronDown } from 'react-icons/fi';
import axios from 'axios';
import './App.css';

const api = axios.create({
    baseURL: 'http://localhost:3005/'
});

const App = () => {
    
    const [tituloBoard, setTituloBoard] = useState('');
    const [filtro, setFiltro] = useState('');
    const [isFiltered, setIsFiltered] = useState(false);
    const [isAdvancedFilter, setIsAdvancedFilter] = useState(false);
    const [board, setBoard] = useState([]);
    const [tarefas, setTarefas] = useState([]);
    const [people, setPeople] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    
    const onDragEnd = (result) => {
        
        if(isFiltered)
        {
            return false;
        }
        
        setFiltro('');
        setIsFiltered(false);
        setSelectedItems([]);

        const { destination, source, type } = result;
        if (!destination) { return; }
        if (destination.droppableId === source.droppableId && destination.index === source.index) { return; }
        
        if (type === 'column') {
            const newColumnOrder = Array.from(board);
            newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, board[source.index]);
            setBoard(newColumnOrder);
            alterarBoard(newColumnOrder);
            return;
        }
        
        const home       = source.droppableId;
        const foreign    = destination.droppableId;
        
        const indexBoard = home.split('-')[1];
        const arrayBoard = board.find((element) => { return (parseInt(element.id) === parseInt(indexBoard)); });
        
        const indexBoardForeign = foreign.split('-')[1];
        const arrayBoardForeign = board.find((element) => { return (parseInt(element.id) === parseInt(indexBoardForeign)); });
        
        if (home === foreign) {
            const newTaskIds = Array.from(arrayBoard.cards);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, arrayBoard.cards[source.index]);            
            const indexOrigem = board.findIndex(x => x.id === arrayBoard.id);
            const newState = { ...board, [indexOrigem] : { id: arrayBoard.id, title: arrayBoard.title, cards: newTaskIds }}
            setBoard(Object.values(newState));
            alterarBoard(Object.values(newState));
            return false;
        }
        
        const homeTaskIds = Array.from(arrayBoard.cards);
              homeTaskIds.splice(source.index, 1);
        
        const foreignTaskIds = Array.from(arrayBoardForeign.cards);
              foreignTaskIds.splice(destination.index, 0, arrayBoard.cards[source.index]);
              
        const indexOrigem = board.findIndex(x => x.id === arrayBoard.id);
        const indexDestino = board.findIndex(x => x.id === arrayBoardForeign.id);
        
        const newState = {
            ...board,
            [indexOrigem] : { id: arrayBoard.id, title: arrayBoard.title, cards: homeTaskIds },
            [indexDestino] : { id: arrayBoardForeign.id, title: arrayBoardForeign.title, cards: foreignTaskIds }
        };
        
        setBoard(Object.values(newState));
        alterarBoard(Object.values(newState));
        
    };

    const loadInfo = async () => {
        let boards = "/boards";
        let people = "/people";
        let tags = "/tags";

        const requestBoards = await api.get(boards);
        const requestPeople = await api.get(people);
        const requestTags = await api.get(tags);

        axios.all([requestBoards, requestPeople, requestTags]).then(axios.spread((...responses) => {
            const responseBoards = responses[0];
            const responsePeople = responses[1];
            const responesTags = responses[2];
            setTituloBoard(responseBoards.data[0].title);
            setBoard(responseBoards.data[0].columns);
            setTarefas(responseBoards.data[0].columns);
            setPeople(responsePeople.data);
            setTags(responesTags.data);
        })).catch(errors => {
            alert('Erro');
        })
    }

    const addColuna = () => {
        
        Swal.fire({
            title: 'Digite o nome da coluna!',
            input: 'text',
            icon: 'warning',
            inputAttributes: {
              autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            showLoaderOnConfirm: true,
            inputValidator: (value) => {
            return new Promise((resolve) => {
                // alert(value);
                if (value !== '') {
                resolve()
                } else {
                resolve('Digite o nome da coluna!')
                }
            })
            }
          }).then((result) => {
            if (result.value) {
                const maxId = board.map((e, x) => { return (e.id); });
                const nextId = (Math.max(...maxId) > 0) ? parseInt(Math.max(...maxId)+1) : 1;
                const newColumn = { ...board, [board.length] : { id: nextId, title: result.value, cards: [] }}
                setBoard(Object.values(newColumn));
                alterarBoard(Object.values(newColumn));
            }
        });
        
    }
    
    const addTarefa = (columnProps) => {
        
        let htmlPeople = ''; people.map((e, index) => {return htmlPeople += `<label><input type="checkbox" id="people-${index}" class="mdPeople" name="mdPeople[]" value="${e.id}-${e.name}-${e.photoURL}"> ${e.name}</label><br>`; });
        let htmlTags = ''; tags.map((e, index) => { return htmlTags += `<label><input type="checkbox" id="tags-${index}" class="mdTags" name="mdTags[]" value="${e}"> ${e}</label><br>`; });

        Swal.fire({
            title: `Cadastrar uma tarefa!`,
            html: '<input name="mdTask" id="mdTask" class="swal2-input">' +
                  '<table style="text-align:left;width:100%;"><tr>'+
                  `<td style="width:50%"><b>Pessoas</b>:<br>`+htmlPeople+`</td>`+
                  '<td style="width:50%"><b>Tags</b>:<br>'+htmlTags+'</td>'+
                  '</tr></table>',
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',            
            preConfirm: () => {
                let mdTask   = Swal.getPopup().querySelector('#mdTask').value;
                let mdPeople = Swal.getPopup().querySelectorAll('.mdPeople');
                let mdTags   = Swal.getPopup().querySelectorAll('.mdTags');
                if (mdTask === '') { Swal.showValidationMessage(`Digite o nome da tarefa`) }
                return {mdTask: mdTask, mdPeople: mdPeople, mdTags: mdTags}
            }
        }).then((result) => {
            if(result.isConfirmed)
            {
                const pessoas = Array.prototype.slice.call(result.value.mdPeople).filter(e => e.checked).map((z) => z.value.split('-'));
                const tagsList = Array.prototype.slice.call(result.value.mdTags).filter(e => e.checked).map((z) => z.value);
                const arrPessoas = pessoas.map((e) => { return { "id": parseInt(e[0]), "name": e[1], "photoURL": e[2]} });
                
                const valores = board.map((e, x) => { 
                    return e.cards.map(v => v.id).join();
                });
                const x = valores.join().split(',').map(x=>+x);
                const xMax = Math.max(...x);
                const newColumn = { ...board, [0] : { id: columnProps.id, title: columnProps.title, cards: [...columnProps.cards, {
                    "id": xMax+1,
                    "title": result.value.mdTask,
                    "tags": Object.values(tagsList),
                    "members": Object.values(arrPessoas)
                    
                }] }}
                adicionarTarefa(Object.values(newColumn));

            }
        })
    }

    const editarColuna = (colunaProps, index) => {

        if(isFiltered)
        {
            return false;
        }
        
        setFiltro('');
        setIsFiltered(false);
        setSelectedItems([]);

        Swal.fire({
            title: `Deseja alterar a coluna ${colunaProps.title}?`,
            input: 'text',
            icon: 'warning',
            inputAttributes: {
              autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
            return new Promise((resolve) => {
                // alert(value);
                if (value !== '') {
                resolve()
                } else {
                resolve('Digite o nome da coluna!')
                }
            })
            }
          }).then((result) => {
            if (result.value) {
                const newState = { ...board, [index] : { id: colunaProps.id, title: result.value, cards: colunaProps.cards }}
                setBoard(Object.values(newState));
                alterarBoard(Object.values(newState));
            }
        });
    }

    const excluirColuna = (colunaProps, index) => {
        
        if(isFiltered)
        {
            return false;
        }
        
        setFiltro('');
        setIsFiltered(false);
        setSelectedItems([]);

        Swal.fire({
            title: `Tem certeza que deseja excluir a coluna ${colunaProps.title}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
          }).then((result) => {
            if (result.value) {
                const newBoard = board.filter((e) => { return (parseInt(e.id) !== parseInt(colunaProps.id)); });
                setBoard(newBoard);
                alterarBoard(newBoard);
            }
        });
    }

    const alterarBoard = (info) => {
        const data = {
            "id": 1,
            "title": "Contratar um Front-End Engineer",
            "columns": info
        }
        api.put('/boards/1', data).then(response => {
            console.log('Gravou');
        }).catch((e)=> {
            console.log(e);
        });
    }
   
    const adicionarTarefa = (info) => {
        const data = {
            "id": 1,
            "title": "Contratar um Front-End Engineer",
            "columns": info
        }
        api.put('/boards/1', data).then(response => {
            setBoard(info);
            console.log('Gravou');
        }).catch((e)=> {
            console.log(e);
        });
    }

    const filtrarBoard = (e) => {
        if(e.target.value.length > 0){
            setIsFiltered(true);
        }
        else{
            setIsFiltered(false);
        }
        const filtered = board.map((element) => {
            return {...element, cards: element.cards.filter((subElement) => subElement.title.toLowerCase().includes(e.target.value.toLowerCase()))}
        });
        setTarefas(filtered);
        setFiltro(e.target.value);
    }

    const handleSelectItem = (id, tipo) => {
        const alreadySelected = selectedItems.findIndex(e => e === id);
        if(alreadySelected >= 0)
        {
            id = null;
            setIsFiltered(false);
            setSelectedItems([]);
        }
        else
        {
            setSelectedItems([id]);
            setIsFiltered(true);
        }        
        if (parseInt(id) === null) {
            const filtereda = board.map((element) => { return {...element} });
            setTarefas(filtereda);        
        }else {
            const filtered = board.map((element) => {
                return {...element, cards: element.cards.filter((subElement) => {
                    if(tipo === 1)
                    {
                        if(subElement.members !== undefined) {  
                            for (let [key] of Object.entries(subElement.members)) {
                                if(parseInt(subElement.members[key].id) === parseInt(id)) { return true; }
                            } 
                        }
                    }
                    else
                    {
                        if(subElement.tags !== undefined) {  
                            for (let [key] of Object.entries(subElement.tags)) {
                                if(subElement.tags[key] === id) { return true; }
                            } 
                        }
                    }
                    
                    return false;
                })};
            });
            setTarefas(filtered);
        }
    }

    const detailTarefa = (props, columnProps) => {

        if(isFiltered)
        {
            return false;
        }

        let membersFilter = columnProps.cards.filter(x => x.id === props.id).map((z) => z.members);
            membersFilter = (membersFilter[0] === undefined) ? [] : Object.values(membersFilter[0]);

        let htmlPeople = ''; people.map((e, index) => {return htmlPeople += `<label><input type="checkbox" ${(membersFilter.find(x => parseInt(x.id) === e.id) instanceof Object) ? 'checked="checked"' : ''} id="people-${index}" class="mdPeople" name="mdPeople[]" value="${e.id}-${e.name}-${e.photoURL}"> ${e.name}</label><br>`; });
        let htmlTags = ''; tags.map((e, index) => { return htmlTags += `<label><input ${(columnProps.cards.filter(x => x.id === props.id).map(z => z.tags.includes(e))[0]) ? 'checked="checked"' : ''} type="checkbox" id="tags-${index}" class="mdTags" name="mdTags[]" value="${e}"> ${e}</label><br>`; });

        Swal.fire({
            title: `Alterar uma tarefa!`,
            html: `<input name="mdTask" value="${props.title}" id="mdTask" class="swal2-input">` +
                  '<table style="text-align:left;width:100%;"><tr>'+
                  `<td style="width:50%"><b>Pessoas</b>:<br>`+htmlPeople+`</td>`+
                  '<td style="width:50%"><b>Tags</b>:<br>'+htmlTags+'</td>'+
                  '</tr></table>',
            showCancelButton: true,
            confirmButtonText: 'Alterar',
            cancelButtonText: 'Cancelar',            
            preConfirm: () => {
                let mdTask   = Swal.getPopup().querySelector('#mdTask').value;
                let mdPeople = Swal.getPopup().querySelectorAll('.mdPeople');
                let mdTags   = Swal.getPopup().querySelectorAll('.mdTags');
                if (mdTask === '') { Swal.showValidationMessage(`Digite o nome da tarefa`) }
                return {mdTask: mdTask, mdPeople: mdPeople, mdTags: mdTags}
            }
        }).then((result) => {
            if(result.isConfirmed)
            {
                const pessoas     = Array.prototype.slice.call(result.value.mdPeople).filter(e => e.checked).map((z) => z.value.split('-'));
                const tagsList    = Array.prototype.slice.call(result.value.mdTags).filter(e => e.checked).map((z) => z.value);
                const arrPessoas  = pessoas.map((e) => { return { "id": parseInt(e[0]), "name": e[1], "photoURL": e[2]} });
                const indexColumn = Object.values(board.map((x, index) => { if(parseInt(x.id) === parseInt(columnProps.id)) { return index; } })).join('');
                const indexTask   = Object.values(board.map(x => { if(parseInt(x.id) === parseInt(columnProps.id)) { return x.cards; }})
                                                       .filter(z => z !== undefined)
                                                       .map(v => { return v.map((b, index) => {if(b.id === props.id) { return index; } })})[0]).join('');
                
                const newState = { ...board, [indexColumn] : { id: columnProps.id, title: columnProps.title, 
                    cards: Object.values({ ...columnProps.cards, [indexTask]: {
                        id: props.id,
                        title: result.value.mdTask,
                        tags: Object.values(tagsList),
                        members: Object.values(arrPessoas)                    
                    }}) 
                }}
                setBoard(Object.values(newState));
                alterarBoard(Object.values(newState));
            }
        })
    }

    useEffect(()=>{
        loadInfo();        
    },[]);

    return (
        <>
        <header>
            <h2>{tituloBoard}</h2>
            <div style={{marginTop:'15px'}}>
                <input type="text" style={{width:'350px'}} placeholder="Pesquisar" name="filtro" value={filtro} onChange={filtrarBoard}/>
                <button className="btn" onClick={() => (isAdvancedFilter) ? setIsAdvancedFilter(false) : setIsAdvancedFilter(true)}>FILTRO AVANÇADO <FiChevronDown /></button>
            </div>
            {(isAdvancedFilter) ? 
            <div>
                <ul className="items-grid">
                {
                (people.length > 0) ?
                people.map(e => (
                    <li 
                        key={e.id}
                        onClick={() => handleSelectItem(e.id, 1)}    
                        className={selectedItems.includes(e.id) ? 'selected' : ''}
                    >
                        {
                        (e.photoURL === null || e.photoURL === "null") ? 
                            <p data-letters={e.name.split(' ').map((e) => e[0]).join('')}></p>
                            : 
                            <p><img src={e.photoURL} alt="Avatar"></img></p>
                        }
                        <span>{e.name}</span>
                    </li>
                )) : ''}
                <li>|</li>
                {
                (tags.length > 0) ?
                tags.map((e, index) => (
                    <li
                        key={index}
                        onClick={() => handleSelectItem(e, 2)}    
                        className={selectedItems.includes(e) ? 'selected' : ''}
                    >
                        <span>{e}</span>
                    </li>
                )) : ''}
                </ul>
            </div>
            : ''}
        </header> 
        <main>
            <section id="conteudo">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable
                        droppableId="all-columns"
                        direction="horizontal"
                        type="column"
                    >
                        {provided => (
                            <div
                                style={{display: 'flex'}}
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {
                                (!isFiltered) ?
                                board.map((column, index) => {
                                    return(
                                        <Draggable 
                                            draggableId={column.id.toString()} 
                                            index={index}
                                            key={column.id}
                                        >
                                            {provided => (
                                            <div className="colunas" {...provided.draggableProps} ref={provided.innerRef}>
                                                <div className="titulo" {...provided.dragHandleProps} style={{display:'flex', justifyContent:'space-between'}}>
                                                    {column.title}
                                                    <div className="dropdown">
                                                        <button className="dropbtn"><FiMoreVertical /></button>
                                                        <div className="dropdown-content">
                                                            <button onClick={() => editarColuna(column, index)}>Renomear</button>
                                                            <button onClick={() => excluirColuna(column, index)}>Excluir</button>
                                                        </div>
                                                    </div>
                                                </div>                                                
                                                <Droppable 
                                                    droppableId={`cards-${column.id.toString()}`} 
                                                    type="task"
                                                >
                                                    {(provided, snapshot) => (
                                                    <div 
                                                        id="listaTarefas"
                                                        style={{ backgroundColor: (snapshot.isDraggingOver) ? '#f5f5f2' : 'inherit' }}
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                    >
                                                        {column.cards.map((tarefa, indexTarefa) => {
                                                            return(
                                                                <Draggable 
                                                                    draggableId={`card-${tarefa.id.toString()}`} 
                                                                    index={indexTarefa}
                                                                    key={tarefa.id}                                                                    
                                                                >
                                                                    {(provided, snapshot) => (
                                                                    <div 
                                                                        onClick={() => detailTarefa(tarefa, column)}
                                                                        className="tarefas"
                                                                        style={{ backgroundColor: (snapshot.isDragging) ? 'lightgreen' : 'white' }}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            ref={provided.innerRef}
                                                                    >
                                                                        {tarefa.title}
                                                                        
                                                                        <div className="box">
                                                                            <div>{tarefa.tags.join(', ')}</div>
                                                                            <div style={{display:'flex'}}>
                                                                                {tarefa.members !== undefined ? tarefa.members.map((e) => {
                                                                                    return (
                                                                                        <div key={e.id}>
                                                                                            {
                                                                                            (e.photoURL === null || e.photoURL === "null") ? 
                                                                                                // <img src={User} alt="Avatar" />
                                                                                                <p data-letters={e.name.split(' ').map((e) => e[0]).join('')}></p>
                                                                                                : 
                                                                                                <img src={e.photoURL} alt="Avatar" />
                                                                                            }
                                                                                            
                                                                                        </div>
                                                                                    )
                                                                                }) : ''}
                                                                                
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    
                                                                    )}
                                                                </Draggable>
                                                            )
                                                        })}
                                                        {(index === 0) ?                                                            
                                                            <div className="new" style={{margin:0}}>
                                                                <div className="newTitulo">
                                                                    <button onClick={() => addTarefa(column)} className="btn-add">+ Tarefa</button>
                                                                </div>
                                                            </div>
                                                        : ''}
                                                        {provided.placeholder}
                                                    </div>
                                                    )}
                                                </Droppable>
                                            </div>
                                        )}
                                        </Draggable>
                                    )            
                                })
                                :
                                tarefas.map((column, index) => {
                                    return(
                                        <Draggable 
                                            draggableId={column.id.toString()} 
                                            index={index}
                                            key={column.id}
                                        >
                                            {provided => (
                                            <div className="colunas" {...provided.draggableProps} ref={provided.innerRef}>
                                                <div className="titulo" {...provided.dragHandleProps} style={{display:'flex', justifyContent:'space-between'}}>
                                                    {column.title}
                                                    <div className="dropdown">
                                                        <button className="dropbtn"><FiMoreVertical /></button>
                                                        <div className="dropdown-content">
                                                            <button onClick={() => editarColuna(column, index)}>Renomear</button>
                                                            <button onClick={() => excluirColuna(column, index)}>Excluir</button>
                                                        </div>
                                                    </div>
                                                </div>                                                
                                                <Droppable 
                                                    droppableId={`cards-${column.id.toString()}`} 
                                                    type="task"
                                                >
                                                    {(provided, snapshot) => (
                                                    <div 
                                                        id="listaTarefas"
                                                        style={{ backgroundColor: (snapshot.isDraggingOver) ? '#f5f5f2' : 'inherit' }}
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                    >
                                                        {column.cards.map((tarefa, indexTarefa) => {
                                                            return(
                                                                <Draggable 
                                                                    draggableId={`card-${tarefa.id.toString()}`} 
                                                                    index={indexTarefa}
                                                                    key={tarefa.id}
                                                                >
                                                                    {(provided, snapshot) => (
                                                                    <div 
                                                                        onClick={() => detailTarefa(tarefa, column)}
                                                                        className="tarefas"
                                                                        style={{ backgroundColor: (snapshot.isDragging) ? 'lightgreen' : 'white' }}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            ref={provided.innerRef}
                                                                    >
                                                                        {tarefa.title}
                                                                        <div className="box">
                                                                            <div>{tarefa.tags.join(', ')}</div>
                                                                            <div style={{display: 'flex'}}>
                                                                                {tarefa.members !== undefined ? tarefa.members.map((e) => {
                                                                                    return (
                                                                                        <div key={e.id}>
                                                                                            {
                                                                                            (e.photoURL === null || e.photoURL === "null") ? 
                                                                                                <p data-letters={e.name.split(' ').map((e) => e[0]).join('')}></p>
                                                                                                : 
                                                                                                <img src={e.photoURL} alt="Avatar"></img>
                                                                                            }
                                                                                        </div>
                                                                                    )
                                                                                }) : ''}
                                                                                
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    
                                                                    )}
                                                                </Draggable>
                                                            )
                                                        })}
                                                        {provided.placeholder}
                                                    </div>
                                                    )}
                                                </Droppable>
                                            </div>
                                        )}
                                        </Draggable>
                                    )            
                                })
                                
                                }
                                <div className="new">
                                    <div className="newTitulo">
                                        <button onClick={addColuna} className="btn-add">+ Coluna</button>
                                    </div>
                                </div>
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </section>       
        </main>
        </>
    );

}

export default App;
