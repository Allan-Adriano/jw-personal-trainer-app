package com.jwpersonal.repository;

import com.jwpersonal.model.Appointment;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface IAppointmentRepository {

    void salvar(Appointment appointment);
    Optional<Appointment> buscarPorId(int id);
    List<Appointment> listarPorAluno(int alunoId);
    List<Appointment> listarPorPersonal(int personalId);
    List<Appointment> listarPorData(int personalId, LocalDate data);

    boolean existeConflito(int personalId, LocalDate data,
                           LocalTime horaInicio, LocalTime horaFim);

    void atualizar(Appointment appointment);
}