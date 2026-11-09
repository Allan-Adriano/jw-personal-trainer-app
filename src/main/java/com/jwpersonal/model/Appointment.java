package com.jwpersonal.model;

import java.time.LocalDate;

public class Appointment {

    private int id;
    private int personalId;
    private int alunoId;
    private LocalDate date;
    private LocalDate starTime;
    private LocalDate endTime;
    private AppointmentStatus status;


    public Appointment(){}

    public Appointment(int personalId, int alunoId, LocalDate date,
                       LocalDate starTime,LocalDate endTime) {

        this.personalId = personalId;
        this.alunoId = alunoId;
        this.date = date;
        this.starTime = starTime;
        this.endTime = endTime;
        this.status = AppointmentStatus.AGENDADO;
    }
}
