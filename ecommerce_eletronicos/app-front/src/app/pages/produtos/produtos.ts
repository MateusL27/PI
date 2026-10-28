import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number;
  categoria: string;
  imagem: string;
}

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './produtos.html',
  styleUrl: './produtos.css',
})
export class Produtos implements OnInit {
  produtos: Produto[] = [];
  mensagemErro = '';

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.http.get<Produto[]>('http://localhost:3000/produtos').subscribe({
      next: (produtos) => {
        this.produtos = produtos;
      },
      error: (erro: unknown) => {
        console.error('Não foi possível carregar os produtos:', erro);
        this.mensagemErro = 'Não foi possível carregar os produtos. Verifique se o json-server está iniciado.';
      },
    });
  }

  sair(): void {
    sessionStorage.removeItem('admLogado');
    this.router.navigate(['/login']);
  }
}
