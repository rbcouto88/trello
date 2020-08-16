Trello

Instalação:

npx create-react-app trello

<b>Os componentes que foram utilizados:</b>

npm install react-beautiful-dnd --save<br>
npm install react-icons --save<br>
npm install sweetalert2<br>
npm install axios<br>

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';<br>
import Swal from "sweetalert2";<br>
import { FiMoreVertical, FiChevronDown } from 'react-icons/fi';<br>
import axios from 'axios';<br>

Poderá realizar as seguintes operações:
  - Colunas
      - Criar: clique no campo que está indicando +COLUNAS;
      - Renomear: para renomear uma coluna, passe o mouse sobre os três pontos e aparecerá a opção;
      - Excluir: para excluir uma coluna, passe o mouse sobre os três pontos e aparecerá a opção;
      - Ordenar: clique no nome da coluna para move-lá.
  - Cartões
      - Criar: clique no campo que está indicando +TAREFAS (Obs.: Apenas o campo tarefa é obrigatório);
      - Editar: para editar uma tarefa, clique nela e altere as informações);
      - Excluir: para excluir uma tarefa, clique na mesma e abrirá um pop up com a opção de excluir;
      - Ordenar: clique na tarefa para movê-la;
  - Mover cartões entre colunas: clique em um cartão pars arrastá-lo;
  - Filtrar os cartões por texto, tag ou responsável: poderá filtrar digitando uma parte do conteúdo da tarefa ou através dos filtros avançados que você poderá clicar nas tags ou responsável. <i>Obs: para retornar a listagem original só desmarcar as opções escolhidas ou limpar o filtro.</i>

Para o back-end, foi utilizado o json-server! Para acessá-lo, execute o comando:<br>

npm install -g json-server<br>

json-server --watch db.json --port 3005
