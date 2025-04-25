// Esta é a forma correta de usar UUID em Deno
import { v4 } from "https://deno.land/std/uuid/mod.ts";

// Função para demonstrar o uso correto do UUID
function generateId() {
  return v4.generate();
}

console.log("ID gerado:", generateId());
