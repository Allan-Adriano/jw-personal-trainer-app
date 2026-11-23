package com.jwpersonal.strategy;

import com.jwpersonal.model.Appointment;
import com.jwpersonal.model.AppointmentStatus;
import com.jwpersonal.model.User;

import java.time.LocalDate;

public class CancelamentoComPrazo implements CancelamentoStrategy{
    @Override
    public void cancelar(Appointment appointment, User usuario, String motivo) {
        if (appointment.getData().equals(LocalDate.now())){
            throw new RuntimeException("Cancelamento não permitido. Prazo mínimo de 24h de antecedência.");
        }
        appointment.setStatus(AppointmentStatus.CANCELADO);
        appointment.setObservacao("Cancelado por : " + usuario.getNome() + ": " + motivo);
    }
}
