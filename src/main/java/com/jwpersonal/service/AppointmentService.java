package com.jwpersonal.service;

import com.jwpersonal.model.Appointment;
import com.jwpersonal.model.AppointmentStatus;
import com.jwpersonal.model.User;
import com.jwpersonal.repository.IAppointmentRepository;
import com.jwpersonal.strategy.CancelamentoStrategy;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public class AppointmentService {

    private final IAppointmentRepository appointmentRepository;
    private CancelamentoStrategy cancelamentoStrategy;

    public AppointmentService(IAppointmentRepository appointmentRepository, CancelamentoStrategy cancelamentoStrategy) {
        this.appointmentRepository = appointmentRepository;
        this.cancelamentoStrategy = cancelamentoStrategy;
    }

    //Permite trocar a politica de cancelamento
    public void setCancelamentoStrategy(CancelamentoStrategy cancelamentoStrategy) {
        this.cancelamentoStrategy = cancelamentoStrategy;
    }

    //Agendar sessão verificado conflito de horários
    public Appointment agendar (User aluno, int personalId,
                                LocalDate data, LocalTime horaInicio, LocalTime horaFim){

        //Verifica se o usuário é aluno.
        if (!aluno.getRole().equalsIgnoreCase("aluno")){
            throw new RuntimeException("Apenas alunos podem agendar sessões.");
        }

        //Impede conflito de horários
        boolean conflito = appointmentRepository.existeConflito(personalId, data, horaInicio, horaFim);
            if (conflito){
                throw new RuntimeException("Conflito de horário. Escolha outro horário.");
            }

        Appointment appointment = new Appointment(personalId, aluno.getId(), data, horaInicio, horaFim);
            appointmentRepository.salvar(appointment);
        return appointment;
    }

    //Confirma o agendamento
    public void confirmar(int appointmentId, User personal) {

        // Verifica se é personal
        if (!personal.getRole().equals("personal")) {
            throw new RuntimeException("Apenas o personal pode confirmar sessões.");
        }

        Appointment appointment = buscarOuErro(appointmentId);

        // RN03 — Impede confirmação duplicada
        if (appointment.isConfirmado()) {
            throw new RuntimeException("Agendamento já foi confirmado.");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELADO) {
            throw new RuntimeException("Não é possível confirmar um agendamento cancelado.");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMADO);
        appointment.setConfirmado(true);
        appointmentRepository.atualizar(appointment);
    }

    //Cancela usando a politica definida (Strategy)
    public void cancelar(int appointmentId, User usuario, String motivo){
        Appointment appointment = buscarOuErro(appointmentId);

        if (appointment.getStatus() == AppointmentStatus.REALIZADO){
            throw new RuntimeException("Não é possível cancelar uma sessão já realizada");
        }
        if (appointment.getStatus() == AppointmentStatus.CANCELADO){
            throw new RuntimeException("Agendamento já está cancelado");
        }

        //Aplica a política de cancelamento
        cancelamentoStrategy.cancelar(appointment,usuario,motivo);
        appointmentRepository.atualizar(appointment);
    }

    //Reagendar sessão
    public void reagendar(int appointmentId, User usuario, LocalDate novaData,
                          LocalTime novaHoraInicio, LocalTime novaHoraFim){

        Appointment appointment = buscarOuErro(appointmentId);

        if (appointment.getStatus() == AppointmentStatus.REALIZADO){
            throw new RuntimeException("Não é possivel reagendar uma sessão já realizada.");
        }

        //Verifica o conflito no novo horário
        boolean conflito = appointmentRepository.existeConflito(appointment.getPersonalId(), novaData,
                novaHoraInicio, novaHoraFim);

        if (conflito){
            throw new RuntimeException("Conflito de horário no novo agendamento.");
        }

        appointment.setData(novaData);
        appointment.setHoraInicio(novaHoraInicio);
        appointment.setHoraFim(novaHoraFim);
        appointment.setStatus(AppointmentStatus.REAGENDADO);
        appointment.setConfirmado(false);
        appointment.setObservacao(motivo(usuario));
        appointmentRepository.atualizar(appointment);
    }

    public List<Appointment> listarPorAluno(int alunoId){
        return appointmentRepository.listarPorAluno(alunoId);
    }

    public List<Appointment> listarPorPersonal(int personalId){
        return appointmentRepository.listarPorPersonal(personalId);
    }

    private Appointment buscarOuErro(int id){
        Optional<Appointment> appointment = appointmentRepository.buscarPorId(id);
        if (appointment.isEmpty()){
            throw new RuntimeException("Agendamento não encontrado.");
        }
        return appointment.get();
    }

    private String motivo(User usuario){
        return "Reagendado por: " + usuario.getNome();
    }

}
