from sqlalchemy import DateTime, Table, Column, Integer, String, ForeignKey, Float, MetaData, create_engine, Boolean
def create_all_metadata():
    metadata_obj = MetaData()
    engine = create_engine("sqlite:///database.db")

    etudiant_table = Table(
        "Etudiant",
        metadata_obj,
        Column("id", Integer, primary_key=True),
        Column("password", String(50)),
        Column("nom", String(50)),
        Column("prenom", String(50)),
        Column("chemin_photo", String(200))
        )

    surveillant_table = Table(
        "Surveillant",
        metadata_obj,
        Column("id", Integer, primary_key=True),
        Column("password", String(50))
        )

    compose_table = Table(
        "Compose",
        metadata_obj,
        Column("id",Integer, primary_key=True),
        Column("etudiant_id",Integer, ForeignKey("Etudiant.id")),
        Column("examen_id", Integer,ForeignKey("Examen.id")),
        Column("note", Float)
        )

    cas_triche_table = Table(
        "CasDeTriche",
        metadata_obj,
        Column("id",Integer, primary_key=True),
        Column("chemin_preuve",String(355)),
        Column("date_heure",DateTime),
        Column("compose_id", Integer,ForeignKey("Compose.id")),
        )

    examen_table = Table(
        "Examen",
        metadata_obj,
        Column("id",Integer, primary_key=True),
        Column("sujet",String(355)),
        Column("surveillant_id", Integer,ForeignKey("Surveillant.id")),
        Column("code", Integer)
        )


    question_examen = Table(
        "Question",
        metadata_obj,
        Column("id",Integer, primary_key=True),
        Column("examen_id", Integer,ForeignKey("Examen.id")),
        Column("contenu_question",String(355))
        )
    
    reponse_examen = Table(
        "Reponse",
        metadata_obj,
        Column("id",Integer, primary_key=True),
        Column("question_id", Integer,ForeignKey("Question.id")),
        Column("contenu_reponse",String(355)),
        Column("est_bonne_reponse",Boolean)
        )
    
    
    metadata_obj.create_all(engine)
