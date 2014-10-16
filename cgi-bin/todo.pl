#!/usr/bin/perl

use strict;
use warnings;

use CGI;
use CGI::Carp 'fatalsToBrowser';
use DBI;
use Data::Dumper;

# прочитать параметры CGI
my $cgi = CGI->new;
my $itemToAdd = $cgi->param("doItem");

# подключиться к базе данных
my $dbh = DBI->connect("DBI:mysql:database=todolist;host=localhost;port=3306",  
  "user", "password") 
  or die $DBI::errstr;

my $statement = qq{INSERT INTO todos (item) VALUES (?)};
my $sth = $dbh->prepare($statement)
  or die $dbh->errstr;

$sth->execute($itemToAdd) or die $sth->errstr;

# создать JSON-строку, соответствующую результату проверки в базе данных
my $json = qq{{"itemToAdd" : "$itemToAdd"}};

# возвратить JSON-строку
print $cgi->header(-type => "application/json", -charset => "utf-8");
print $json;