package com.jwpersonal.repository.impl;

import com.jwpersonal.database.DatabaseConnection;
import com.jwpersonal.model.Session;
import com.jwpersonal.model.SessionStatus;
import com.jwpersonal.repository.ISessionRepository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class SessionRepositoryImpl implements ISessionRepository {

    private Connection getConnection() throws SQLException {
        return DatabaseConnection.getInstance().getConnection();
    }

    @Override
    public void salvar(Session s) {
        String sql = """
            INSERT INTO sessions
            (appointment_id, status, observacoes, registrada)
            VALUES (?, ?, ?, ?)
        """;
        try (PreparedStatement stmt = getConnection().prepareStatement(sql,
                Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, s.getAppointmentId());
            stmt.setString(2, s.getStatus().name());
            stmt.setString(3, s.getObservacoes());
            stmt.setBoolean(4, s.isRegistrada());
            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) s.setId(rs.getInt(1));

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar sessão: " + e.getMessage());
        }
    }

    @Override
    public Optional<Session> buscarPorId(int id) {
        String sql = "SELECT * FROM sessions WHERE id = ?";
        try (PreparedStatement stmt = getConnection().prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) return Optional.of(mapear(rs));
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar sessão: " + e.getMessage());
        }
        return Optional.empty();
    }

    @Override
    public Optional<Session> buscarPorAgendamento(int appointmentId) {
        String sql = "SELECT * FROM sessions WHERE appointment_id = ?";
        try (PreparedStatement stmt = getConnection().prepareStatement(sql)) {
            stmt.setInt(1, appointmentId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) return Optional.of(mapear(rs));
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar sessão: " + e.getMessage());
        }
        return Optional.empty();
    }

    @Override
    public List<Session> listarPorAluno(int alunoId) {
        String sql = """
            SELECT s.* FROM sessions s
            JOIN appointments a ON s.appointment_id = a.id
            WHERE a.aluno_id = ?
            ORDER BY s.id DESC
        """;
        List<Session> lista = new ArrayList<>();
        try (PreparedStatement stmt = getConnection().prepareStatement(sql)) {
            stmt.setInt(1, alunoId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao listar sessões: " + e.getMessage());
        }
        return lista;
    }

    @Override
    public void atualizar(Session s) {
        String sql = """
            UPDATE sessions SET
            status=?, observacoes=?, concluido_em=?, registrada=?
            WHERE id=?
        """;
        try (PreparedStatement stmt = getConnection().prepareStatement(sql)) {
            stmt.setString(1, s.getStatus().name());
            stmt.setString(2, s.getObservacoes());
            stmt.setTimestamp(3, s.getConcluidoEm() != null ?
                    Timestamp.valueOf(s.getConcluidoEm()) : null);
            stmt.setBoolean(4, s.isRegistrada());
            stmt.setInt(5, s.getId());
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar sessão: " + e.getMessage());
        }
    }

    private Session mapear(ResultSet rs) throws SQLException {
        Session s = new Session();
        s.setId(rs.getInt("id"));
        s.setAppointmentId(rs.getInt("appointment_id"));
        s.setStatus(SessionStatus.valueOf(rs.getString("status")));
        s.setObservacoes(rs.getString("observacoes"));
        s.setRegistrada(rs.getBoolean("registrada"));
        Timestamp ts = rs.getTimestamp("concluido_em");
        if (ts != null) s.setConcluidoEm(ts.toLocalDateTime());
        return s;
    }
}
