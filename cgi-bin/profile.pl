#!/usr/bin/perl

use strict;
use warnings;

use CGI;
use CGI::Carp 'fatalsToBrowser';
use DBI;
use Data::Dumper;

use lib "/home/nina/perl5/lib/perl5";
use JSON;

# прочитать параметры CGI
my $cgi = CGI->new;
my $user_id = $cgi->param("id");

# подключиться к базе данных
my $dbh = DBI->connect("DBI:mysql:database=todolist;host=localhost;port=3306",  
  "user", "password") 
  or die $DBI::errstr;

# проверить имя пользователя и пароль в базе данных
my $statement = qq{SELECT * FROM profiles WHERE user_id=?};
my $sth = $dbh->prepare($statement)
  or die $dbh->errstr;
$sth->execute($user_id)
  or die $sth->errstr;
my $hash_result = $sth->fetchall_hashref('list_id');

# создать JSON-строку, соответствующую результату проверки в базе данных
my $json = JSON->new->utf8->encode($hash_result);

# возвратить JSON-строку
print $cgi->header(-type => "application/json", -charset => "utf-8");
print $json;