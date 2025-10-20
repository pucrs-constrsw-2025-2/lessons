# API Endpoints Detalhados

A seguir, uma documentação detalhada dos endpoints disponíveis para manipulação de `Lessons` e `Subjects`, incluindo a estrutura de requisição e resposta esperada.

---

## **Endpoints para `Lessons` (`/lessons`)**

### **1. `POST {{BASE_URL}}/lessons`**
- **Funcionalidade:** Criação de um novo objeto de lição.
- **Descrição:** Permite enviar os dados de uma lição para criar um novo registro no sistema.

**Request**
- Headers
  - `Authorization: Bearer <token_jwt>` (se aplicável)
  - `Content-Type: application/json`
  - `Accept: application/json`
- Body
```json
{
  "sequence": 1,
  "date": "2025-10-27T10:00:00Z",
  "roomId": "e2c3a5b6-d7e8-9f01-2345-6789abcd0123",
  "classId": "a1b2c3d4-e5f6-7890-1234-5678abcd9012"
}
```

**Response**
- Code
  - `201 Created`: Requisição bem-sucedida, o objeto foi criado.
  - `400 Bad Request`: Requisição inválida, incluindo JSON com erros de validação.
  - `401 Unauthorized`: Autenticação ausente ou inválida.
  - `403 Forbidden`: Usuário autenticado sem permissão.
  - `409 Conflict`: Conflito, por exemplo, se `sequence` e `date` já existirem (já que é `@@unique([sequence, date])`).
- Body
```json
{
  "id": "7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f",
  "sequence": 1,
  "date": "2025-10-27T10:00:00.000Z",
  "roomId": "e2c3a5b6-d7e8-9f01-2345-6789abcd0123",
  "classId": "a1b2c3d4-e5f6-7890-1234-5678abcd9012"
}
```

---

### **2. `GET {{BASE_URL}}/lessons`**
- **Funcionalidade:** Recuperação de todos os objetos de lição.
- **Descrição:** Retorna uma lista completa de todas as lições cadastradas no sistema.

**Request**
- Headers
  - `Authorization: Bearer <token_jwt>` (se aplicável)
  - `Accept: application/json`
- Body
  - *Nenhum*

**Response**
- Code
  - `200 OK`: Requisição bem-sucedida.
  - `401 Unauthorized`: Autenticação ausente ou inválida.
  - `403 Forbidden`: Usuário autenticado sem permissão.
  - `204 No Content`: Nenhuma lição encontrada.
- Body
```json
[
  {
    "id": "7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f",
    "sequence": 1,
    "date": "2025-10-27T10:00:00.000Z",
    "roomId": "e2c3a5b6-d7e8-9f01-2345-6789abcd0123",
    "classId": "a1b2c3d4-e5f6-7890-1234-5678abcd9012"
  },
  {
    "id": "f8e7d6c5-b4a3-2109-8765-4321fedcba98",
    "sequence": 2,
    "date": "2025-10-28T11:00:00.000Z",
    "roomId": "1234abcd-ef01-2345-6789-abcd01234567",
    "classId": "fedcba98-7654-3210-fedc-ba9876543210"
  }
]
```

---

### **3. `GET {{BASE_URL}}/lessons/{id}`**
- **Funcionalidade:** Recuperação de um objeto de lição pelo seu ID.
- **Descrição:** Busca e retorna uma lição específica utilizando seu identificador único.

**Request**
- Headers
  - `Authorization: Bearer <token_jwt>` (se aplicável)
  - `Accept: application/json`
- Body
  - *Nenhum*
- Path Parameters
  - `id`: `string` (UUID da lição)

**Response**
- Code
  - `200 OK`: Requisição bem-sucedida.
  - `400 Bad Request`: ID inválido (não é um UUID válido).
  - `401 Unauthorized`: Autenticação ausente ou inválida.
  - `403 Forbidden`: Usuário autenticado sem permissão.
  - `404 Not Found`: Lição com o ID fornecido não encontrada.
- Body
```json
{
  "id": "7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f",
  "sequence": 1,
  "date": "2025-10-27T10:00:00.000Z",
  "roomId": "e2c3a5b6-d7e8-9f01-2345-6789abcd0123",
  "classId": "a1b2c3d4-e5f6-7890-1234-5678abcd9012"
}
```

---

### **4. `PUT {{BASE_URL}}/lessons/{id}`**
- **Funcionalidade:** Atualização total de um objeto de lição.
- **Descrição:** Substitui completamente os dados de uma lição existente pelo ID fornecido, exigindo que todos os campos obrigatórios de `CreateLessonDto` sejam enviados.

**Request**
- Headers
  - `Authorization: Bearer <token_jwt>` (se aplicável)
  - `Content-Type: application/json`
  - `Accept: application/json`
- Body
```json
{
  "sequence": 1,
  "date": "2025-10-27T10:00:00Z",
  "roomId": "e2c3a5b6-d7e8-9f01-2345-6789abcd0123",
  "classId": "a1b2c3d4-e5f6-7890-1234-5678abcd9012"
}
```
- Path Parameters
  - `id`: `string` (UUID da lição a ser atualizada)

**Response**
- Code
  - `200 OK`: Requisição bem-sucedida, o objeto foi atualizado.
  - `400 Bad Request`: Requisição inválida, incluindo JSON com erros de validação (ex: campos obrigatórios ausentes).
  - `401 Unauthorized`: Autenticação ausente ou inválida.
  - `403 Forbidden`: Usuário autenticado sem permissão.
  - `404 Not Found`: Lição com o ID fornecido não encontrada.
  - `409 Conflict`: Conflito, por exemplo, se `sequence` e `date` já existirem em outra lição.
- Body
```json
{
  "id": "7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f",
  "sequence": 1,
  "date": "2025-10-27T10:00:00.000Z",
  "roomId": "e2c3a5b6-d7e8-9f01-2345-6789abcd0123",
  "classId": "a1b2c3d4-e5f6-7890-1234-5678abcd9012"
}
```

---

### **5. `PATCH {{BASE_URL}}/lessons/{id}`**
- **Funcionalidade:** Atualização parcial (de alguns atributos) de um objeto de lição.
- **Descrição:** Atualiza seletivamente os campos de uma lição existente pelo ID fornecido, aceitando apenas os campos que precisam ser modificados.

**Request**
- Headers
  - `Authorization: Bearer <token_jwt>` (se aplicável)
  - `Content-Type: application/json`
  - `Accept: application/json`
- Body
```json
{
  "sequence": 2
}
```
- Path Parameters
  - `id`: `string` (UUID da lição a ser atualizada)

**Response**
- Code
  - `200 OK`: Requisição bem-sucedida, o objeto foi atualizado.
  - `400 Bad Request`: Requisição inválida, incluindo JSON com erros de validação.
  - `401 Unauthorized`: Autenticação ausente ou inválida.
  - `403 Forbidden`: Usuário autenticado sem permissão.
  - `404 Not Found`: Lição com o ID fornecido não encontrada.
  - `409 Conflict`: Conflito, por exemplo, se a atualização da `sequence` e `date` resultar em uma combinação já existente.
- Body
```json
{
  "id": "7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f",
  "sequence": 2,
  "date": "2025-10-27T10:00:00.000Z",
  "roomId": "e2c3a5b6-d7e8-9f01-2345-6789abcd0123",
  "classId": "a1b2c3d4-e5f6-7890-1234-5678abcd9012"
}
```

---

### **6. `DELETE {{BASE_URL}}/lessons/{id}`**
- **Funcionalidade:** Exclusão de um objeto de lição.
- **Descrição:** Remove uma lição específica do sistema utilizando seu identificador único.

**Request**
- Headers
  - `Authorization: Bearer <token_jwt>` (se aplicável)
- Body
  - *Nenhum*
- Path Parameters
  - `id`: `string` (UUID da lição a ser excluída)

**Response**
- Code
  - `200 OK`: Requisição bem-sucedida, o objeto foi excluído.
  - `400 Bad Request`: ID inválido (não é um UUID válido).
  - `401 Unauthorized`: Autenticação ausente ou inválida.
  - `403 Forbidden`: Usuário autenticado sem permissão.
  - `404 Not Found`: Lição com o ID fornecido não encontrada.
- Body
```json
{
  "id": "7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f",
  "sequence": 2,
  "date": "2025-10-27T10:00:00.000Z",
  "roomId": "e2c3a5b6-d7e8-9f01-2345-6789abcd0123",
  "classId": "a1b2c3d4-e5f6-7890-1234-5678abcd9012"
}
```
*(O corpo da resposta de DELETE geralmente retorna o objeto deletado, mas pode variar para apenas um status de sucesso sem corpo, dependendo da implementação)*

---

## **Endpoints para `Subjects` (Aninhados em `Lessons`: `/lessons/{lessonId}/subjects`)**

### **7. `POST {{BASE_URL}}/lessons/{lessonId}/subjects`**
- **Funcionalidade:** Criação de um novo objeto de assunto associado a uma lição.
- **Descrição:** Permite criar um novo assunto (`CreateSubjectDto`) e associá-lo à lição especificada pelo `lessonId`.

**Request**
- Headers
  - `Authorization: Bearer <token_jwt>` (se aplicável)
  - `Content-Type: application/json`
  - `Accept: application/json`
- Body
```json
{
  "description": "Introdução à Programação",
  "credits": 4,
  "lessonId": "7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f"
}
```
- Path Parameters
  - `lessonId`: `string` (UUID da lição à qual o assunto será associado)

**Response**
- Code
  - `201 Created`: Requisição bem-sucedida, o objeto foi criado.
  - `400 Bad Request`: Requisição inválida, incluindo JSON com erros de validação.
  - `401 Unauthorized`: Autenticação ausente ou inválida.
  - `403 Forbidden`: Usuário autenticado sem permissão.
  - `404 Not Found`: Lição com o `lessonId` fornecido não encontrada.
- Body
```json
{
  "id": "a0b1c2d3-e4f5-6789-0123-456789abcdef",
  "description": "Introdução à Programação",
  "credits": 4,
  "lessonId": "7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f"
}
```

---

### **8. `GET {{BASE_URL}}/lessons/{lessonId}/subjects`**
- **Funcionalidade:** Recuperação de todos os objetos de assunto de uma lição.
- **Descrição:** Retorna uma lista de todos os assuntos que pertencem à lição especificada pelo `lessonId`.

**Request**
- Headers
  - `Authorization: Bearer <token_jwt>` (se aplicável)
  - `Accept: application/json`
- Body
  - *Nenhum*
- Path Parameters
  - `lessonId`: `string` (UUID da lição)

**Response**
- Code
  - `200 OK`: Requisição bem-sucedida.
  - `400 Bad Request`: ID de lição inválido.
  - `401 Unauthorized`: Autenticação ausente ou inválida.
  - `403 Forbidden`: Usuário autenticado sem permissão.
  - `404 Not Found`: Lição com o `lessonId` fornecido não encontrada.
  - `204 No Content`: Nenhuma assunto encontrada para a lição.
- Body
```json
[
  {
    "id": "a0b1c2d3-e4f5-6789-0123-456789abcdef",
    "description": "Introdução à Programação",
    "credits": 4,
    "lessonId": "7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f"
  },
  {
    "id": "f0e1d2c3-b4a5-6789-0123-456789fedcba",
    "description": "Estruturas de Dados",
    "credits": 6,
    "lessonId": "7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f"
  }
]
```

---

### **9. `GET {{BASE_URL}}/lessons/{lessonId}/subjects/{subjectId}`**
- **Funcionalidade:** Recuperação de um objeto de assunto específico de uma lição.
- **Descrição:** Busca e retorna um assunto específico (`subjectId`) que está associado à lição (`lessonId`).

**Request**
- Headers
  - `Authorization: Bearer <token_jwt>` (se aplicável)
  - `Accept: application/json`
- Body
  - *Nenhum*
- Path Parameters
  - `lessonId`: `string` (UUID da lição)
  - `subjectId`: `string` (UUID do assunto)

**Response**
- Code
  - `200 OK`: Requisição bem-sucedida.
  - `400 Bad Request`: ID de lição ou assunto inválido.
  - `401 Unauthorized`: Autenticação ausente ou inválida.
  - `403 Forbidden`: Usuário autenticado sem permissão.
  - `404 Not Found`: Lição ou assunto com os IDs fornecidos não encontrado.
- Body
```json
{
  "id": "a0b1c2d3-e4f5-6789-0123-456789abcdef",
  "description": "Introdução à Programação",
  "credits": 4,
  "lessonId": "7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f"
}
```

---

### **10. `PUT {{BASE_URL}}/lessons/{lessonId}/subjects/{subjectId}`**
- **Funcionalidade:** Atualização total de um objeto de assunto específico de uma lição.
- **Descrição:** Substitui completamente os dados de um assunto (`subjectId`) associado a uma lição (`lessonId`), exigindo que todos os campos obrigatórios de `CreateSubjectDto` sejam enviados.

**Request**
- Headers
  - `Authorization: Bearer <token_jwt>` (se aplicável)
  - `Content-Type: application/json`
  - `Accept: application/json`
- Body
```json
{
  "description": "Tópicos Avançados em Programação",
  "credits": 8,
  "lessonId": "7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f"
}
```
- Path Parameters
  - `lessonId`: `string` (UUID da lição)
  - `subjectId`: `string` (UUID do assunto a ser atualizado)

**Response**
- Code
  - `200 OK`: Requisição bem-sucedida, o objeto foi atualizado.
  - `400 Bad Request`: Requisição inválida, incluindo JSON com erros de validação (ex: campos obrigatórios ausentes).
  - `401 Unauthorized`: Autenticação ausente ou inválida.
  - `403 Forbidden`: Usuário autenticado sem permissão.
  - `404 Not Found`: Lição ou assunto com os IDs fornecidos não encontrado.
- Body
```json
{
  "id": "a0b1c2d3-e4f5-6789-0123-456789abcdef",
  "description": "Tópicos Avançados em Programação",
  "credits": 8,
  "lessonId": "7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f"
}
```

---

### **11. `PATCH {{BASE_URL}}/lessons/{lessonId}/subjects/{subjectId}`**
- **Funcionalidade:** Atualização parcial de um objeto de assunto específico de uma lição.
- **Descrição:** Atualiza seletivamente os campos de um assunto (`subjectId`) associado a uma lição (`lessonId`), aceitando apenas os campos que precisam ser modificados.

**Request**
- Headers
  - `Authorization: Bearer <token_jwt>` (se aplicável)
  - `Content-Type: application/json`
  - `Accept: application/json`
- Body
```json
{
  "credits": 6
}
```
- Path Parameters
  - `lessonId`: `string` (UUID da lição)
  - `subjectId`: `string` (UUID do assunto a ser atualizado)

**Response**
- Code
  - `200 OK`: Requisição bem-sucedida, o objeto foi atualizado.
  - `400 Bad Request`: Requisição inválida, incluindo JSON com erros de validação.
  - `401 Unauthorized`: Autenticação ausente ou inválida.
  - `403 Forbidden`: Usuário autenticado sem permissão.
  - `404 Not Found`: Lição ou assunto com os IDs fornecidos não encontrado.
- Body
```json
{
  "id": "a0b1c2d3-e4f5-6789-0123-456789abcdef",
  "description": "Introdução à Programação",
  "credits": 6,
  "lessonId": "7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f"
}
```

---

### **12. `DELETE {{BASE_URL}}/lessons/{lessonId}/subjects/{subjectId}`**
- **Funcionalidade:** Exclusão de um objeto de assunto específico de uma lição.
- **Descrição:** Remove um assunto específico (`subjectId`) que está associado à lição (`lessonId`).

**Request**
- Headers
  - `Authorization: Bearer <token_jwt>` (se aplicável)
- Body
  - *Nenhum*
- Path Parameters
  - `lessonId`: `string` (UUID da lição)
  - `subjectId`: `string` (UUID do assunto a ser excluído)

**Response**
- Code
  - `200 OK`: Requisição bem-sucedida, o objeto foi excluído.
  - `400 Bad Request`: ID de lição ou assunto inválido.
  - `401 Unauthorized`: Autenticação ausente ou inválida.
  - `403 Forbidden`: Usuário autenticado sem permissão.
  - `404 Not Found`: Lição ou assunto com os IDs fornecidos não encontrado.
- Body
```json
{
  "id": "a0b1c2d3-e4f5-6789-0123-456789abcdef",
  "description": "Introdução à Programação",
  "credits": 6,
  "lessonId": "7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f"
}
```
*(O corpo da resposta de DELETE geralmente retorna o objeto deletado, mas pode variar para apenas um status de sucesso sem corpo, dependendo da implementação)*
