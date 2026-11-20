package com.jwpersonal.repository.impl;

import com.jwpersonal.database.DatabaseConnection;
import com.jwpersonal.model.Appointment;
import com.jwpersonal.model.AppointmentStatus;
import com.jwpersonal.repository.IAppointmentRepository;

import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class AppointmentRepositoryImpl implements IAppointmentRepository {

    private Connection getConnection() throws SQLException {
        return DatabaseConnection.getInstance().getConnection();
    }

    @Override
    public void salvar(Appointment a) {
        String sql = """
            INSERT INTO appointments
            (personal_id, aluno_id, data, hora_inicio, hora_fim, status, observacao, confirmado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """;
        try (PreparedStatement stmt = getConnection().prepareStatement(sql,
                Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, a.getPersonalId());
            stmt.setInt(2, a.getAlunoId());
            stmt.setDate(3, Date.valueOf(a.getData()));
            stmt.setTime(4, Time.valueOf(a.getHoraInicio()));
            stmt.setTime(5, Time.valueOf(a.getHoraFim()));
            stmt.setString(6, a.getStatus().name());
            stmt.setString(7, a.getObservacao());
            stmt.setBoolean(8, a.isConfirmado());
            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) a.setId(rs.getInt(1));

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar agendamento: " + e.getMessage());
        }
    }

    @Override
    public Optional<Appointment> buscarPorId(int id) {
        String sql = "SELECT * FROM appointments WHERE id = ?";
        try (PreparedStatement stmt = getConnection().prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) return Optional.of(mapear(rs));
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar agendamento: " + e.getMessage());
        }
        return Optional.empty();
    }

    @Override
    public List<Appointment> listarPorAluno(int alunoId) {
        String sql = "SELECT * FROM appointments WHERE aluno_id = ? ORDER BY data, hora_inicio";
        List<Appointment> lista = new ArrayList<>();
        try (PreparedStatement stmt = getConnection().prepareStatement(sql)) {
            stmt.setInt(1, alunoId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao listar agendamentos: " + e.getMessage());
        }
        return lista;
    }


    @Override
    public List<Appointment> listarPorPersonal(int personalId) {
        String sql = "SELECT * FROM appointments WHERE personal_id = ? ORDER BY data, hora_inicio";
        List<Appointment> lista = new ArrayList<>();
        try (PreparedStatement stmt = getConnection().prepareStatement(sql)) {
            stmt.setInt(1, personalId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao listar agendamentos: " + e.getMessage());
        }
        return lista;
    }

    @Override
    public List<Appointment> listarPorData(int personalId, LocalDate data) {
        String sql = "SELECT * FROM appointments WHERE personal_id = ? AND data = ?";
        List<Appointment> lista = new ArrayList<>();
        try (PreparedStatement stmt = getConnection().prepareStatement(sql)) {
            stmt.setInt(1, personalId);
            stmt.setDate(2, Date.valueOf(data));
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao listar agendamentos: " + e.getMessage());
        }
        return lista;
    }

    @Override
    public boolean existeConflito(int personalId, LocalDate data,
                                  LocalTime horaInicio, LocalTime horaFim) {
        String sql = """
            SELECT COUNT(*) FROM appointments
            WHERE personal_id = ?
            AND data = ?
            AND status NOT IN ('CANCELADO', 'AUSENCIA')
            AND (hora_inicio < ? AND hora_fim > ?)
        """;
        try (PreparedStatement stmt = getConnection().prepareStatement(sql)) {
            stmt.setInt(1, personalId);
            stmt.setDate(2, Date.valueOf(data));
            stmt.setTime(3, Time.valueOf(horaFim));
            stmt.setTime(4, Time.valueOf(horaInicio));
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) return rs.getInt(1) > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao verificar conflito: " + e.getMessage());
        }
        return false;
    }

    @Override
    public void atualizar(Appointment a) {
        String sql = """
            UPDATE appointments SET
            status=?, observacao=?, confirmado=?,
            hora_inicio=?, hora_fim=?, data=?
            WHERE id=?
        """;
        try (PreparedStatement stmt = getConnection().prepareStatement(sql)) {
            stmt.setString(1, a.getStatus().name());
            stmt.setString(2, a.getObservacao());
            stmt.setBoolean(3, a.isConfirmado());
            stmt.setTime(4, Time.valueOf(a.getHoraInicio()));
            stmt.setTime(5, Time.valueOf(a.getHoraFim()));
            stmt.setDate(6, Date.valueOf(a.getData()));
            stmt.setInt(7, a.getId());
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar agendamento: " + e.getMessage());
        }
    }

    private Appointment mapear(ResultSet rs) throws SQLException {
        Appointment a = new Appointment();
        a.setId(rs.getInt("id"));
        a.setPersonalId(rs.getInt("personal_id"));
        a.setAlunoId(rs.getInt("aluno_id"));
        a.setData(rs.getDate("data").toLocalDate());
        a.setHoraInicio(rs.getTime("hora_inicio").toLocalTime());
        a.setHoraFim(rs.getTime("hora_fim").toLocalTime());
        a.setStatus(AppointmentStatus.valueOf(rs.getString("status")));
        a.setObservacao(rs.getString("observacao"));
        a.setConfirmado(rs.getBoolean("confirmado"));
        return a;
    }
}
