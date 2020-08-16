Trello

<b>Os componentes que foram utilizados:</b>

npm install react-beautiful-dnd --save<br>
npm install react-icons --save<br>
npm install sweetalert2<br>

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';<br>
import Swal from "sweetalert2";<br>
import { FiMoreVertical, FiChevronDown } from 'react-icons/fi';<br>

Você poderá realizar as seguintes operações:
  - Colunas
      - Criar (clicar no campo que está indicando + COLUNAS), 
      - Renomear (para renomear uma coluna, basta passar o mouse sobre os 3 pontos e irá aparecer a opção) 
      - Excluir (para excluir uma coluna, basta passar o mouse sobre os 3 pontos e irá aparecer a opção) 
      - Ordenar (basta clicar no nome da coluna e move-lá)
  - Criar, editar, excluir e ordenar cartões
  - Mover cartões entre colunas (basta clicar em um cartão e arrasta-lo)
  - Filtrar os cartões por texto, tag e/ou responsável (Poderá filtrar digitando uma parte do conteúdo da tarefa, ou através dos filtros avançados que você poderá clicar nas tags ou responsável, para o filtro retornar a sua listagem original só desmarcar as opções escolhidas)

Para o back-end foi utilizado o json-server para acessar executar o comando:<br>
json-server --watch db.json --port 3005
