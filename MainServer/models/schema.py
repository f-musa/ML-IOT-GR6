from sqlalchemy import DateTime, Table, Column, Integer, String, ForeignKey, Float, MetaData, create_engine, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class Etudiant(Base):
    __tablename__ = "Etudiant"
    id = Column(String, primary_key=True)
    password = Column(String)
    nom = Column(String)
    prenom = Column(String)
    chemin_photo = Column(String)

    def __init__(self,id, password, nom, prenom, chemin_photo):
        self.id = id
        self.password = password
        self.nom = nom
        self.prenom = prenom
        self.chemin_photo = chemin_photo

class Surveillant(Base):
    __tablename__ = "Surveillant"
    id = Column(String, primary_key=True)
    password = Column(String)

    def __init__(self, id,password):
        self.id = id
        self.password = password

class Compose(Base):
    __tablename__ = "Compose"
    id = Column(Integer, primary_key=True)
    etudiant_id = Column(String, ForeignKey("Etudiant.id"))
    examen_id = Column(Integer, ForeignKey("Examen.id"))
    note = Column(Float)
    etudiant = relationship("Etudiant")
    examen = relationship("Examen")

    def __init__(self, etudiant_id, examen_id, note):
        self.etudiant_id = etudiant_id
        self.examen_id = examen_id
        self.note = note

class CasDeTriche(Base):
    __tablename__ = "CasDeTriche"
    id = Column(Integer, primary_key=True)
    chemin_preuve = Column(String)
    date_heure = Column(DateTime)
    compose_id = Column(Integer, ForeignKey("Compose.id"))
    compose = relationship("Compose")

    def __init__(self, chemin_preuve, date_heure, compose_id):
        self.chemin_preuve = chemin_preuve
        self.date_heure = date_heure
        self.compose_id = compose_id

class Examen(Base):
    __tablename__ = "Examen"
    id = Column(Integer, primary_key=True)
    sujet = Column(String)
    surveillant_id = Column(String, ForeignKey("Surveillant.id"))
    code = Column(Integer)
    surveillant = relationship("Surveillant")

    def __init__(self, sujet, surveillant_id, code):
        self.sujet = sujet
        self.surveillant_id = surveillant_id
        self.code = code

class Question(Base):
    __tablename__ = "Question"
    id = Column(Integer, primary_key=True)
    examen_id = Column(Integer, ForeignKey("Examen.id"))
    contenu_question = Column(String)
    examen = relationship("Examen")

    def __init__(self, examen_id, contenu_question):
        self.examen_id = examen_id
        self.contenu_question = contenu_question

class Reponse(Base):
    __tablename__ = "Reponse"
    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey("Question.id"))
    contenu_reponse = Column(String)
    est_bonne_reponse = Column(Boolean)
    question = relationship("Question")

    def __init__(self, question_id, contenu_reponse, est_bonne_reponse):
        self.question_id = question_id
        self.contenu_reponse = contenu_reponse
        self.est_bonne_reponse = est_bonne_reponse

def create_database():
    engine = create_engine("sqlite:///database.db",echo=True)  
    Base.metadata.create_all(engine)
    return engine

def create_session():
    engine = create_engine("sqlite:///database.db",echo=True)
    Session = sessionmaker(bind=engine)
    session = Session()
    return session