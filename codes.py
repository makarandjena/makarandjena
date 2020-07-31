# Install spaCy 
!pip3 install -U spacy
 
# Install textacy which will also be useful
!pip3 install -U textacy
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from io import StringIO
from collections import Counter
from spacy.matcher import PhraseMatcher

from google.colab import files
uploaded = files.upload()

import io

column_names= ['Name', 'Domain', 'Event1', 'Event2']
  
  # Get the data 
#df1 = pd.read_csv(io.BytesIO(uploaded['Employees.txt']), sep='\t', names=column_names)
df1 = pd.read_csv(io.BytesIO(uploaded['Employees.txt']), sep='\t', names=column_names)
      
  # Check the head of the data 
df1.head(10)

from google.colab import files
uploaded = files.upload()

column_names3=['Domain','Event1','Event']
event_names=pd.read_csv(io.BytesIO(uploaded['Total_Dataset_3.txt']),sep = '\t',names=column_names3)
event_names.head(10)

event_organizing=pd.merge(df1,event_names)
event_organizing= event_organizing.drop('Event2',1)

import spacy
import en_core_web_sm
nlp = en_core_web_sm.load()

import random
from collections import Counter #for counting
import seaborn as sns #for visualization
import pandas.util.testing as tm
text = event_names.Event[random.sample(range(1,100),10)]

text.head()

text_combined = str(text)

doc = nlp(text_combined)

for token in doc:
    print(token)

for token in doc:
    print(token.text, token.pos_)

nouns = list(doc.noun_chunks)
nouns

list(doc.sents)

for ent in doc.ents:
    print(ent.text,ent.label_)

event_organizing_all = event_organizing[["Name","Domain","Event"]]
event_organizing_all.head()

list_docs = []
for i in range(len(event_organizing_all)):
  if event_organizing_all['Event'][i] != '':
    doc = nlp("u" + event_organizing_all['Event'][i] + "'")
    list_docs.append(doc)
print(len(list_docs))

def calculateSimWithSpacy(nlp, event_organizing_all, text_combined, n=6):
    list_sim = []
    doc1 = nlp("u" + text_combined + "'")
    for i in event_organizing_all.index:
      try:
            doc2 = list_docs[i]
            score = doc1.similarity(doc2)
            list_sim.append((doc1, doc2, score))
      except:
            continue
    return list_sim

u = "Corey Moran"
index = np.where(event_organizing['Name'] == u)[0][0]
user_q = event_organizing.iloc[[index]]
user_q

list_docs = []
for i in range(len(event_organizing_all)):
  doc = nlp("u'" + event_organizing_all['Event'][i] + "'")
  list_docs.append((doc,i))
print(len(list_docs))

def calculateSimWithSpaCy(nlp, df, user_text, n=6):
    # Calculate similarity using spaCy
    list_sim =[]
    doc1 = nlp("u'" + user_text + "'")
    for i in df.index:
      try:
            doc2 = list_docs[i][0]
            score = doc1.similarity(doc2)
            list_sim.append((doc1, doc2, list_docs[i][1],score))
      except:
        continue
 
    return  list_sim

user_q.Event[199]

df3 = calculateSimWithSpaCy(nlp, event_organizing_all, user_q.Event[199], n=15)

df_recom_spacy = pd.DataFrame(df3).sort_values([3], ascending=False).head(10)

df_recom_spacy.reset_index(inplace=True)

index_spacy = df_recom_spacy[2]
list_scores = df_recom_spacy[3]

def get_recommendation(top, event_organizing_all, scores):
  recommendation = pd.DataFrame(columns = ['Event','Name'])
  count = 0
  for i in top:
      recommendation.at[count, 'Name'] = event_organizing_all['Name'][i]
      #recommendation.at[count, 'Domain'] = event_organizing_all['Domain'][i]
      recommendation.at[count, 'Event'] = event_organizing_all['Event'][i]
      #recommendation.at[count, 'score'] =  scores[count]

      count += 1

  return recommendation

get_recommendation(index_spacy, event_organizing_all, list_scores)

event_admin_db = {'Jay':['J',5678],'Noel':['N',1357]}

def event_admin_login():
    event_admin_id = input('Enter Admin ID')
    passcode = int(input('enter password'))
    if(event_admin_id in event_admin_db and event_admin_db[event_admin_id][1]==passcode):
        event_recommendation()    
    else:
        return False,False
 
def event_recommendation():
    event = input("Enter The Event")
    index = np.where(get_recommendation(index_spacy, event_organizing_all, list_scores)['Event'] == event)[0][0]
    #index = np.where(event_organizing['Name'] == u)[0][0]
    #user_q = event_organizing.iloc[[index]]
    user_q = get_recommendation(index_spacy, event_organizing_all, list_scores).iloc[[index]]
    print(user_q)
    print(get_recommendation(index_spacy, event_organizing_all, list_scores))

event_admin_login()

from openpyxl.workbook import Workbook
get_recommendation(index_spacy, event_organizing_all, list_scores).to_excel("get_recommendation.xlsx")
