-- Script de inicialización PostgreSQL: Esquemas Lógicos Multi-Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS motor_equipos;
CREATE SCHEMA IF NOT EXISTS motor_evaluacion;
CREATE SCHEMA IF NOT EXISTS motor_formacion;
