package com.jwpersonal.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseConnection {

    private static DatabaseConnection instance;
    private Connection connection;

    private static final String URL = "jdbc:postgresql://localhost:5433/jwpersonal";
    private static final String USER = "postgres";
    private static final String PASSWORD = "postgres";

    // Singleton — construtor privado
    private DatabaseConnection() throws SQLException {
        this.connection = DriverManager.getConnection(URL, USER, PASSWORD);
        System.out.println("Conexão com o banco estabelecida!");
        initializeTables();
    }

    // Singleton — ponto de acesso global
    public static DatabaseConnection getInstance() throws SQLException {
        if (instance == null || instance.connection.isClosed()) {
            instance = new DatabaseConnection();
        }
        return instance;
    }

    public Connection getConnection() {
        return connection;
    }

    private void initializeTables() throws SQLException {
        Statement stmt = connection.createStatement();

        // Tabela de usuários
        stmt.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'aluno',
            ativo BOOLEAN NOT NULL DEFAULT TRUE
        )
    """);

        // Tabela de agendamentos
        stmt.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            id SERIAL PRIMARY KEY,
            personal_id INTEGER NOT NULL,
            aluno_id INTEGER NOT NULL,
            data DATE NOT NULL,
            hora_inicio TIME NOT NULL,
            hora_fim TIME NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'AGENDADO',
            observacao TEXT,
            confirmado BOOLEAN NOT NULL DEFAULT FALSE,
            FOREIGN KEY (personal_id) REFERENCES users(id),
            FOREIGN KEY (aluno_id) REFERENCES users(id)
        )
    """);

        // Tabela de sessões
        stmt.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id SERIAL PRIMARY KEY,
            appointment_id INTEGER NOT NULL UNIQUE,
            status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
            observacoes TEXT,
            concluido_em TIMESTAMP,
            registrada BOOLEAN NOT NULL DEFAULT FALSE,
            FOREIGN KEY (appointment_id) REFERENCES appointments(id)
        )
    """);

        stmt.close();
        System.out.println("Tabelas inicializadas com sucesso!");
    }
}