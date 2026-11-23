package com.jwpersonal.model;

import java.time.LocalDate;
import java.time.LocalTime;

public class Appointment {

    private int id;
    private int personalId;
    private int alunoId;
    private LocalDate data;
    private LocalTime horaInicio;
    private LocalTime horaFim;
    private AppointmentStatus status;
    private String observacao;
    private boolean confirmado;


    public Appointment(){}

    public Appointment(int personalId, int alunoId, LocalDate date,
                       LocalTime horaInicio,LocalTime horaFim) {

        this.personalId = personalId;
        this.alunoId = alunoId;
        this.data = date;
        this.horaInicio = horaInicio;
        this.horaFim = horaFim;
        this.status = AppointmentStatus.AGENDADO;
        this.confirmado = false;
    }

    //Getters e Setters


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getPersonalId() {
        return personalId;
    }

    public void setPersonalId(int personalId) {
        this.personalId = personalId;
    }

    public int getAlunoId() {
        return alunoId;
    }

    public void setAlunoId(int alunoId) {
        this.alunoId = alunoId;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate date) {
        this.data = date;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFim() {
        return horaFim;
    }

    public void setHoraFim(LocalTime horaFim) {
        this.horaFim = horaFim;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public boolean isConfirmado() {
        return confirmado;
    }

    public void setConfirmado(boolean confirmado) {
        this.confirmado = confirmado;
    }

    @Override
    public String toString() {
        return "Appointment{id=" + id + ", data=" + data +
                ", horaInicio=" + horaInicio + ", horaFim=" + horaFim +
                ", status=" + status + ", confirmado=" + confirmado + "}";
    };

}
